const { PinataSDK } = require("pinata-web3");
require("dotenv").config();

const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_JWT,
	pinataGateway: process.env.GATEWAY_URL
})

async function main() {
	try {
		const file = await pinata.gateways.get(process.env.IPFS_HASH_METADATA);

		console.log(file.data);
	} catch (error) {
		console.log(error);
	}
}

main();