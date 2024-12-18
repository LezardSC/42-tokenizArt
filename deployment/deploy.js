const hre = require("hardhat");

async function main() {
	const GirlToken = await hre.ethers.getContractFactory("Girl42");
	const Girl42 = await GirlToken.deploy("Girl42Name", "ONLY1 ");

	await Girl42.waitForDeployment();

	const address = await Girl42.getAddress();
	console.log("Girl42 Token deployed at: ", address);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
