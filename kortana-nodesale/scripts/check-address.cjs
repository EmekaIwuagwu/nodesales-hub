const { ethers } = require('ethers');

async function main() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.testnet.kortana.xyz/');
    const addr = "0xd31303e73A0601D6785E9516692D4A8eB8fA0A99B";
    const code = await provider.getCode(addr);
    console.log(`Code Length: ${code.length}`);
    if (code === "0x") {
        console.log("No contract at this address!");
        // Let's try the previous one?
        console.log(`Previous: 0x60dD3Caa3Cf48C786f8bb6DD18946e18564bF7F2`);
        console.log(`Code Previous: ${(await provider.getCode("0x60dD3Caa3Cf48C786f8bb6DD18946e18564bF7F2")).length}`);
    } else {
        console.log("Contract Found!");
    }
}

main().catch(console.error);
