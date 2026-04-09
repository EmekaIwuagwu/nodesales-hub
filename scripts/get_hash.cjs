const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

async function main() {
    const artifactPath = path.join(__dirname, 'artifacts', 'contracts', 'core', 'KortanaPair.sol', 'KortanaPair.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const bytecode = artifact.bytecode;
    const hash = ethers.keccak256(bytecode);
    console.log('Bytecode Hash:', hash);
}

main().catch(console.error);
