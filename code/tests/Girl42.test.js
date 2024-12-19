const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Girl42 NFT Contract", function () {
    let Girl42;
    let girl42;
    let owner;
    let addr1;
    let initialOwner;

    const tokenId = 1; // Fixed token ID
    const name = "Girl42 Collection";
    const symbol = "G42";
    const ipfsURI = "ipfs://QmHashOfTheImageOrMetadata";
    const onChainMetadata = "On-chain JSON metadata string";
    const onChainImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3..."; // example SVG/Base64

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        initialOwner = owner.address;

        Girl42 = await ethers.getContractFactory("Girl42");
        girl42 = await Girl42.deploy(name, symbol, initialOwner);
		await girl42.waitForDeployment();
	});

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await girl42.owner()).to.equal(initialOwner);
        });

        it("Should have the correct name and symbol", async function () {
            expect(await girl42.name()).to.equal(name);
            expect(await girl42.symbol()).to.equal(symbol);
        });

        it("Should not have the token minted yet", async function () {
            expect(await girl42.exists()).to.be.false;
            await expect(girl42.tokenURI(tokenId)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
        });
    });

    describe("Minting", function () {
        it("Should mint the NFT when called by the owner", async function () {
            await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);

            expect(await girl42.exists()).to.be.true;
            expect(await girl42.ownerOf(tokenId)).to.equal(initialOwner);
        });

        it("Should fail if NFT is already minted", async function () {
            await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
            await expect(
                girl42.mintNFT(initialOwner, "anotherIPFS", "anotherMetadata", "anotherImage")
            ).to.be.revertedWith("NFT already minted");
        });

        it("Should fail if non-owner tries to mint", async function () {
            await expect(
                girl42.connect(addr1).mintNFT(addr1.address, ipfsURI, onChainMetadata, onChainImage)
            ).to.be.revertedWithCustomError(girl42, "OwnableUnauthorizedAccount");
        });

        it("Should fail if IPFS URI is empty", async function () {
            await expect(
                girl42.mintNFT(initialOwner, "", onChainMetadata, onChainImage)
            ).to.be.revertedWith("IPFS URI cannot be empty");
        });

        it("Should fail if On-chain metadata is empty", async function () {
            await expect(
                girl42.mintNFT(initialOwner, ipfsURI, "", onChainImage)
            ).to.be.revertedWith("On-chain metadata cannot be empty");
        });

        it("Should fail if On-chain image is empty", async function () {
            await expect(
                girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, "")
            ).to.be.revertedWith("On-chain image cannot be empty");
        });
    });

    describe("Metadata after Minting", function () {
        beforeEach(async function () {
            await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
        });

        it("Should return the correct token URI", async function () {
            const returnedURI = await girl42.tokenURI(tokenId);
            expect(returnedURI).to.contain(ipfsURI);
            expect(returnedURI).to.contain(onChainMetadata);
            expect(returnedURI).to.contain(onChainImage);
        });

        it("Should be able to get IPFS URI", async function () {
            const fetchedIPFSURI = await girl42.getIPFSURI();
            expect(fetchedIPFSURI).to.equal(ipfsURI);
        });

        it("Should be able to get On-Chain Metadata", async function () {
            const fetchedMetadata = await girl42.getOnChainMetadata();
            expect(fetchedMetadata).to.equal(onChainMetadata);
        });

        it("Should be able to get On-Chain Image", async function () {
            const fetchedImage = await girl42.getOnChainImage();
            expect(fetchedImage).to.equal(onChainImage);
        });
    });

    describe("Updating Metadata", function () {
        const newIPFS = "ipfs://QmNewHash";
        const newMetadata = "Updated on-chain metadata";
        const newImage = "data:image/svg+xml;base64,PHN2ZyB4bWxuc...NEW";

        beforeEach(async function () {
            await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
        });

        it("Should allow the owner to update IPFS URI", async function () {
            await girl42.updateIPFSURI(newIPFS);
            expect(await girl42.getIPFSURI()).to.equal(newIPFS);
        });

        it("Should revert if non-owner tries to update IPFS URI", async function () {
            await expect(
                girl42.connect(addr1).updateIPFSURI(newIPFS)
            ).to.be.revertedWithCustomError(girl42, "OwnableUnauthorizedAccount");
        });

        it("Should allow the owner to update On-Chain Metadata", async function () {
            await girl42.updateOnChainMetadata(newMetadata);
            expect(await girl42.getOnChainMetadata()).to.equal(newMetadata);
        });

        it("Should allow the owner to update On-Chain Image", async function () {
            await girl42.updateOnChainImage(newImage);
            expect(await girl42.getOnChainImage()).to.equal(newImage);
        });

        it("Should allow updating all metadata fields at once", async function () {
            await girl42.updateMetadata(newIPFS, newMetadata, newImage);
            expect(await girl42.getIPFSURI()).to.equal(newIPFS);
            expect(await girl42.getOnChainMetadata()).to.equal(newMetadata);
            expect(await girl42.getOnChainImage()).to.equal(newImage);
        });

        it("Should only update fields that are not empty when using updateMetadata", async function () {
            // Update only the IPFS URI
            await girl42.updateMetadata(newIPFS, "", "");

            expect(await girl42.getIPFSURI()).to.equal(newIPFS);
            expect(await girl42.getOnChainMetadata()).to.equal(onChainMetadata); // unchanged
            expect(await girl42.getOnChainImage()).to.equal(onChainImage);       // unchanged
        });

        it("Should revert if trying to update metadata before token is minted", async function () {
            // Deploy a fresh contract without minting
            const fresh = await Girl42.deploy(name, symbol, initialOwner);
            await fresh.waitForDeployment();
            
            await expect(
                fresh.updateIPFSURI(newIPFS)
            ).to.be.revertedWith("Token does not exist");

            await expect(
                fresh.updateOnChainMetadata(newMetadata)
            ).to.be.revertedWith("Token does not exist");

            await expect(
                fresh.updateOnChainImage(newImage)
            ).to.be.revertedWith("Token does not exist");
        });
    });
});
