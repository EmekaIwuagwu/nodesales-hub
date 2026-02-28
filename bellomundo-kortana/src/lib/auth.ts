import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifyMessage, getAddress } from "viem";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Ethereum",
            credentials: {
                message: { label: "Message", type: "text" },
                signature: { label: "Signature", type: "text" },
                address: { label: "Address", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.message || !credentials?.signature || !credentials?.address) {
                    console.log("[Auth] FAIL: Missing credentials");
                    return null;
                }

                try {
                    // Normalize address to EIP-55 checksum — must match what was signed
                    const checksumAddress = getAddress(credentials.address);
                    console.log("[Auth] Address:", checksumAddress);
                    console.log("[Auth] Message repr:", JSON.stringify(credentials.message));
                    console.log("[Auth] Sig:", credentials.signature.slice(0, 20) + "...");

                    // Step 1: Verify signature (this MUST succeed — it's the identity proof)
                    const isValid = await verifyMessage({
                        address: checksumAddress,
                        message: credentials.message,
                        signature: credentials.signature as `0x${string}`,
                    });

                    console.log("[Auth] Signature valid:", isValid);

                    if (!isValid) {
                        console.log("[Auth] FAIL: Signature mismatch");
                        return null;
                    }

                    // Step 2: Try to save/fetch user from DB — best effort, does NOT block login
                    let userId = `wallet_${checksumAddress.toLowerCase()}`;
                    let displayName = checksumAddress;

                    try {
                        await connectToDatabase();
                        let user = await User.findOne({ walletAddress: checksumAddress.toLowerCase() });
                        if (!user) {
                            user = await User.create({
                                walletAddress: checksumAddress.toLowerCase(),
                                kycStatus: 'none',
                                createdAt: new Date(),
                            });
                            console.log("[Auth] New citizen registered:", checksumAddress);
                        }
                        userId = user._id.toString();
                        displayName = user.displayName || checksumAddress;
                        console.log("[Auth] DB citizen loaded:", userId);
                    } catch (dbErr: any) {
                        // DB is unavailable — still allow login (signature is valid)
                        console.warn("[Auth] DB unavailable, using wallet address as identity:", dbErr?.message);
                    }

                    // Auth succeeds as long as signature is valid
                    return {
                        id: userId,
                        address: checksumAddress,
                        name: displayName,
                    };

                } catch (e: any) {
                    console.error("[Auth] Fatal error:", e?.message || e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.address = token.address;
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.address = user.address;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
};
