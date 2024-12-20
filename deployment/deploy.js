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

	const onChainMetadata = loadOnChainMetadata(path.join(__dirname, "../images/metadata.json"));
    const tx = await Girl42.mintNFT(deployer.address, onChainMetadata);

    await tx.wait();
	console.log(`On-chain metadata and image have been set.`);
    console.log(`Minted NFT with metadata URI: ${metadataURI}`);
}

/**
 * @param {string} metadataPath
 * @returns {string}
 */
function loadOnChainMetadata(metadataPath) {
    const metadata = fs.readFileSync(metadataPath, "utf8");
    return metadata;
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
