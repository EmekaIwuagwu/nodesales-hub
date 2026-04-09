const { ethers } = require('hardhat');

async function main() {
    const addresses = {
        FACTORY: "0x306Ff98Caa25Fee776dDF7a0D00EB2514B1Da2c6",
        ROUTER:  "0xe636dd1dcC9f8Dc73b87B1A52d50E182446413b4",
        PAIR:    "0x4211654d90e08fa8d3358B4689947fe83a9AC0dD"
    };

    const provider = ethers.provider;

    for (const [name, addr] of Object.entries(addresses)) {
        const code = await provider.getCode(addr);
        console.log(`${name} (${addr}):`);
        if (code === "0x") {
            console.log("❌ EMPTY (No code found!)");
        } else {
            console.log("✅ Code Found. Length:", code.length);
        }
    }
}

main().catch(console.error);
