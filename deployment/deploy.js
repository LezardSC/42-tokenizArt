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

	await mintNft(deployer, Girl42);
}

async function mintNft(deployer, Girl42) {
	const address = await Girl42.getAddress();

	console.log("Girl42 contract deployed at: ", address);

	const metadataURI = process.env.IPFS_HASH_METADATA;
    const tx = await Girl42.mintNFT(deployer.address, `ipfs://${metadataURI}`);

    await tx.wait();
	console.log(`On-chain metadata and image have been set.`);
    console.log(`Minted NFT with metadata URI: ${metadataURI}`);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
