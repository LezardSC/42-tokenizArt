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
    const onChainMetadata = "On-chain JSON metadata string";

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
            await girl42.mintNFT(initialOwner, onChainMetadata);

            expect(await girl42.exists()).to.be.true;
            expect(await girl42.ownerOf(tokenId)).to.equal(initialOwner);
        });

        it("Should fail if NFT is already minted", async function () {
            await girl42.mintNFT(initialOwner, onChainMetadata);
            await expect(
                girl42.mintNFT(initialOwner, "anotherMetadata")
            ).to.be.revertedWith("NFT already minted");
        });

        it("Should fail if non-owner tries to mint", async function () {
            await expect(
                girl42.connect(addr1).mintNFT(addr1.address, onChainMetadata)
            ).to.be.revertedWithCustomError(girl42, "OwnableUnauthorizedAccount");
        });

        it("Should fail if On-chain metadata is empty", async function () {
            await expect(
                girl42.mintNFT(initialOwner, "")
            ).to.be.revertedWith("On-chain metadata cannot be empty");
        });

    });

    describe("Metadata after Minting", function () {
        beforeEach(async function () {
            await girl42.mintNFT(initialOwner, onChainMetadata);
        });

        it("Should return the correct token URI", async function () {
            const returnedURI = await girl42.tokenURI(tokenId);
            expect(returnedURI).to.contain(onChainMetadata);
        });

        it("Should be able to get On-Chain Metadata", async function () {
            const fetchedMetadata = await girl42.getOnChainMetadata();
            expect(fetchedMetadata).to.equal(onChainMetadata);
        });

    });

    describe("Updating Metadata", function () {
        const newIPFS = "ipfs://QmNewHash";
        const newMetadata = "Updated on-chain metadata";
        const newImage = "data:image/svg+xml;base64,PHN2ZyB4bWxuc...NEW";

        beforeEach(async function () {
            await girl42.mintNFT(initialOwner, onChainMetadata);
        });

        it("Should allow the owner to update On-Chain Metadata", async function () {
            await girl42.updateOnChainMetadata(newMetadata);
            expect(await girl42.getOnChainMetadata()).to.equal(newMetadata);
        });


        it("Should revert if trying to update metadata before token is minted", async function () {
            // Deploy a fresh contract without minting
            const fresh = await Girl42.deploy(name, symbol, initialOwner);
            await fresh.waitForDeployment();

            await expect(
                fresh.updateOnChainMetadata(newMetadata)
            ).to.be.revertedWith("Token does not exist");
        });
    });
});
