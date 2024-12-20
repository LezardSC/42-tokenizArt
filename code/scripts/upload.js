const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
const path = require("path");
require("dotenv").config()

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
})

async function uploadImage() {
    try {
        const filePath = path.join(__dirname, "../../images/NFT_42.png");
        
        if (!filePath.match(/\.(png|jpg|jpeg)$/i)) {
            console.error("Invalid file type. Please upload a PNG or JPG image.");
            return;
        }

        const blob = new Blob([fs.readFileSync(filePath)]);
        const file = new File([blob], "NFT_42.png", { type: "image/png" })
        const upload = await pinata.upload.file(file);

        console.log("Image uploaded successfully: ", upload);
        return upload.IpfsHash;
    } catch(error) {
        console.log("Error uploading image: ", error.message || error);
        return;
    }
}

async function uploadMetadata(cid) {
    try {
        const metadata = {
            name: "42Girl",
            description: "NFT for the 42 school project TokenizArt. Drawn by Hordake.",
            image: `ipfs://${cid}`,
            external_link: `https://gateway.pinata.cloud/ipfs/${cid}`,
            artist: "jrenault"
        };

        fs.writeFileSync(path.join(__dirname, "../../images/metadata.json"), JSON.stringify(metadata, null, 2));

        const upload = await pinata.upload.json(metadata);

        console.log("Metadata uploaded successfully: ", upload);
        
        return upload.IpfsHash;
    } catch (error) {
        console.error("Error uploading metadata: ", error.message || error);
    }
}

async function main() {
    const image = await uploadImage();

    if (!image || image === undefined) {
        console.error("Failed to upload image. Exiting...");
        return ;
    }
    const metadata = await uploadMetadata(image);

    if (!metadata) {
        console.error("Failed to upload metadata. Exiting...");
        return;
    }

    console.log(`Image available at: https://gateway.pinata.cloud/ipfs/${image}`);
    console.log(`Metadata available at: https://gateway.pinata.cloud/ipfs/${metadata}`);
}

main();