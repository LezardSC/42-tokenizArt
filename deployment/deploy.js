const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying the contract with account: ", deployer.address);

	const GirlToken = await hre.ethers.getContractFactory("Girl42");
	const Girl42 = await GirlToken.deploy(
		"Girl42",
		"G42",
		deployer.address
	);

	await Girl42.waitForDeployment();

    const address = await Girl42.getAddress();
    console.log("Girl42 contract deployed at: ", address);

    // Save ABI and address to JSON files
    // saveFrontendFiles(Girl42, address);

	// await mintNft(deployer, Girl42);
}

async function mintNft(deployer, Girl42) {
	const address = await Girl42.getAddress();

	const metadataURI = process.env.IPFS_HASH_METADATA;
    const tx = await Girl42.mintNFT(deployer.address, `ipfs://${metadataURI}`);

    await tx.wait();
	console.log(`On-chain metadata and image have been set.`);
    console.log(`Minted NFT with metadata URI: ${metadataURI}`);
}

function saveFrontendFiles(address) {
    const contractsDir = path.join(__dirname, "website/contracts");

    // Ensure the directory exists
    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    // Extract ABI and save as girl42-abi.json
    const abiPath = path.join(__dirname, "../code/artifacts/contracts/Girl42.sol/Girl42.json");
    const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf8"));
    fs.writeFileSync(path.join(contractsDir, "girl42-abi.json"), JSON.stringify(contractJson.abi, null, 2));

    // Save address as girl42-address.json
    fs.writeFileSync(
        path.join(contractsDir, "girl42-address.json"),
        JSON.stringify({ address }, null, 2)
    );
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
