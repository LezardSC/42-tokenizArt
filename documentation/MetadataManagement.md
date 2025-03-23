# Metadata Management Documentation

## Overview

Metadata Management for **Girl42 NFT** allows the owner of the contract to securely store, retrieve, and update NFT metadata. It ensures the NFT information remains accurate, decentralized, and accessible.

## Smart Contract Implementation

#### Storage Variables

The metadata is stored directly on-chain using the IPFS URI:

```solidity
string private _metadataIPFS;
```

#### Core Metadata Functions

`getOnChainMetadata`

**Visibility**: `public view`

**Purpose**: Retrieves the current on-chain IPFS metadata URI.

**Function Logic:**
- Ensures NFT exists before returning metadata.

```solidity
function getOnChainMetadata() public view returns (string memory) {
    require(_ownerOf(1) != address(0), "Token does not exist");
    return _metadataIPFS;
}
```

`updateOnChainMetadata`

**Visibility:** `public` (restricted to `onlyOwner`)

**Purpose:** Allows updating the metadata IPFS URI after minting.

**Function Logic:**

- Ensures NFT is already minted.
- Allows the contract owner to set new metadata.

```solidity
function updateOnChainMetadata(string memory newMetadata) public onlyOwner {
    require(_ownerOf(1) != address(0), "Token does not exist");
    _metadataIPFS = newMetadata;
}
```

## IPFS Integration (Pinata)

The NFT metadata JSON and image files are stored on IPFS via Pinata, ensuring immutability, decentralization, and resilience against centralized data loss or alteration.

#### Metadata Upload (`upload.js`):

Automatically creates and uploads JSON metadata to IPFS through Pinata, outputting an IPFS hash for use in the contract.

**Example metadata JSON structure:**

```json
{
    "name": "42Girl",
    "description": "NFT for the 42 school project TokenizArt. Drawn by Horzeau.",
    "image": "ipfs://QmImageHash",
    "external_link": "https://gateway.pinata.cloud/ipfs/QmImageHash",
    "artist": "jrenault"
}
```

#### Frontend & Backend Integration

The frontend interacts with metadata through the smart contract using Web3.js. The backend Express server securely provides metadata configuration to the frontend.
Backend Configuration (`server.js`):

Endpoint `/config` serves contract metadata configuration:

```javascript
app.get('/config', (req, res) => {
    res.json({
        contractAddress: process.env.CONTRACT_ADDRESS,
        metadataURI: process.env.IPFS_HASH_METADATA,
    });
});
```

## Frontend Metadata Retrieval and Display (`app.js`):

- Fetches metadata IPFS URI from the backend.
- Uses this IPFS URI to display NFT metadata directly in the frontend interface.

Example retrieval:
```javascript
const config = await fetch('http://localhost:3000/config').then(res => res.json());
const metadataURI = `ipfs://${config.metadataURI}`;

// Display metadata or integrate it into the minting process
```

## Metadata Testing

Comprehensive tests validate secure, correct, and consistent metadata handling by the smart contract.

✅ **Verify Correct Metadata After Minting**

Ensures metadata integrity and accurate retrieval after minting:

```javascript
it("Should be able to get On-Chain Metadata", async function () {
    await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
    
    const fetchedMetadata = await girl42.getOnChainMetadata();
    expect(fetchedMetadata).to.equal(onChainMetadata);
});
```

🔄 **Owner Can Update Metadata**

Confirms owner-exclusive metadata update capability:

```javascript
it("Should allow the owner to update On-Chain Metadata", async function () {
    await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
    
    const newMetadata = "Updated on-chain metadata";
    await girl42.updateOnChainMetadata(newMetadata);
    
    expect(await girl42.getOnChainMetadata()).to.equal(newMetadata);
});
```

🚫 **Non-owner Restriction on Metadata Updates**

Verifies metadata updates are restricted exclusively to the contract owner:

```javascript
it("Should revert if non-owner tries to update On-Chain Metadata", async function () {
    await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);
    
    await expect(
        girl42.connect(addr1).updateOnChainMetadata("New metadata")
    ).to.be.revertedWithCustomError(girl42, "OwnableUnauthorizedAccount");
});
```

⛔ **Updating Metadata Before Minting (Should Fail)**

Ensures metadata updates are only allowed after the NFT has been minted:

```javascript
it("Should revert if trying to update metadata before token is minted", async function () {
    const fresh = await Girl42.deploy(name, symbol, initialOwner);
    await fresh.waitForDeployment();

    await expect(
        fresh.updateOnChainMetadata("New metadata")
    ).to.be.revertedWith("Token does not exist");
});
```

## Security Considerations

- **Owner-only Metadata Updates:** Ensures only authorized users (contract owner) can modify the metadata.

- **Validation of Existence:** Metadata operations are restricted to ensure token existence, preventing unauthorized or erroneous updates.

## Usage Example

#### Updating Metadata (Contract Owner):

```solidity
updateOnChainMetadata("ipfs://QmNewMetadataHash");
```

#### Retrieving Metadata (Public):

```solidity
getOnChainMetadata();
```

## Important Considerations

- IPFS metadata is immutable; updating the on-chain pointer redirects to new immutable IPFS metadata.

- Metadata updates should be infrequent and deliberate, as changes impact perceived authenticity and historical context.

## Potential Extensions

- **Metadata Versioning:** Implementing metadata history tracking on-chain.

- **Enhanced Access Control:** Allowing multisig or DAO-style approvals for metadata updates.

- **Extended Metadata:** Adding additional metadata fields (e.g., creation date, attributes).