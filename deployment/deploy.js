const hre = require("hardhat");
require("dotenv").config()

async function main() {
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying the contract with account: ", deployer.address);

	const GirlToken = await hre.ethers.getContractFactory("Girl42");
	const Girl42 = await GirlToken.deploy(
		"Girl42",
		"G42",
		process.env.IPFS_HASH_METADATA,
		deployer.address
	);

	await Girl42.waitForDeployment();

	const address = await Girl42.getAddress();
	console.log("Girl42 Token deployed at: ", address);

	const metadataURI = `ipfs://${process.env.IPFS_HASH_METADATA}`;
    const tx = await Girl42.mintNFT(deployer.address, metadataURI);
    await tx.wait();
    console.log(`Minted NFT with metadata URI: ${metadataURI}`);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});





// const hre = require("hardhat");

// async function main() {
//     const [deployer] = await hre.ethers.getSigners();
//     console.log("Deploying the contract with account:", deployer.address);

//     // Deploy the contract
//     const GirlToken = await hre.ethers.getContractFactory("Girl42");
//     const girl42 = await GirlToken.deploy("Girl42Name", "ONLY1");

//     await girl42.deployed();
//     console.log("Girl42 Token deployed at:", girl42.address);

//     // Mint a token
//     const metadataURI = "ipfs://YOUR_METADATA_CID";
//     const tx = await girl42.mintNFT(deployer.address, metadataURI);
//     await tx.wait();
//     console.log(`Minted NFT with metadata URI: ${metadataURI}`);
// }

// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });
