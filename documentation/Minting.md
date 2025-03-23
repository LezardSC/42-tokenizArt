# Minting Documentation

## Overview

Minting is the central functionality of the Girl42 NFT project, enabling the creation and ownership of the NFT. The contract is explicitly designed to mint only a single unique NFT, ensuring exclusivity and value.

## Smart Contract Implementation

#### Minting Function: `mintNFT`

**Visibility:** `public` (restricted by `onlyOwner`)

**Purpose:** Mint the Girl42 NFT to a specified recipient address and set the NFT metadata.

**Function Signature:**

```solidity
function mintNFT(
	address recipient,
	string memory onChainMetadata
) public onlyOwner
```

**Parameters:**

- `recipient`: Ethereum address receiving the NFT.
- `onChainMetadata`: IPFS URI pointing to metadata of the NFT.

**Function Logic:**

- Checks if the NFT has already been minted (ensuring only one NFT can ever exist).
- Validates that `onChainMetadata` is not empty.
- Mints the NFT to the recipient's address with a fixed token ID (`1`).
- Stores the metadata IPFS URI on-chain.

**Solidity Code Snippet:**

```solidity
function mintNFT(
	address recipient,
	string memory onChainMetadata
) public onlyOwner {
	require(!_minted, "NFT already minted");
	require(bytes(onChainMetadata).length > 0, "On-chain metadata cannot be empty");
	
	_mint(recipient, 1); // fixed token ID = 1
	_minted = true;
	_metadataIPFS = onChainMetadata;
}
```

## Deployment and Minting Process

#### Deployment via Hardhat (`deploy.js`):

- Contract deployment and initial minting process:

```javascript
const GirlToken = await hre.ethers.getContractFactory("Girl42");
const Girl42 = await GirlToken.deploy("Girl42", "G42", deployer.address);
await Girl42.waitForDeployment();

console.log("Girl42 contract deployed at:", await Girl42.getAddress());
```

#### Minting (if done directly after deployment):

Optionally, mint immediately after deployment by uncommenting this line in your deploy script:

```javascript
await mintNft(deployer, Girl42);
```

Minting function (in `deploy.js`):

```solidity
async function mintNft(deployer, Girl42) {
	const metadataURI = process.env.IPFS_HASH_METADATA;
	const tx = await Girl42.mintNFT(deployer.address, `ipfs://${metadataURI}`);

	await tx.wait();
	console.log("Minted NFT with metadata URI:", metadataURI);
}
```

## IPFS Integration for Minting Metadata

#### Using Pinata SDK (`upload.js`):

- Upload the NFT image to IPFS.
- Create and upload JSON metadata containing name, description, artist, and IPFS image link.

```bash
node code/scripts/upload.js
```

This command uploads your asset and metadata, outputting IPFS URIs to be used during minting.

- Metadata Example (`metadata.json`):

```json
{
    "name": "42Girl",
    "description": "NFT for the 42 school project TokenizArt. Drawn by Horzeau.",
    "image": "ipfs://QmYourImageHash",
    "external_link": "https://gateway.pinata.cloud/ipfs/QmYourImageHash",
    "artist": "jrenault"
}
```

## Frontend & Backend Interaction

#### Frontend Interaction (`app.js`):

- Connect wallet (MetaMask) via Web3.js.
- Check if the NFT has already been minted.
- Allow minting if available.

**Minting Logic (Frontend):**

```javascript
mintButton.addEventListener('click', async () => {
	if (accounts.length === 0) {
		statusDiv.innerText = 'Please connect your wallet first.';
		return;
	}

	try {
		const config = await fetch('http://localhost:3000/config').then(res => res.json());
		const metadataURI = `ipfs://${config.metadataURI}`;

		const recipient = accounts[0];
		const mintTx = await girl42Contract.methods.mintNFT(recipient, metadataURI).send({ from: recipient });

		console.log('Transaction successful:', mintTx);
		statusDiv.innerText = 'NFT minted successfully!';

		// Disable mint button after minting
		mintButton.disabled = true;
	} catch (error) {
		console.error('Error minting NFT:', error);
		statusDiv.innerText = 'Failed to mint NFT.';
	}
});
```

#### Backend Configuration (`server.js`):

- Serves the contract ABI and configuration details (contract address, IPFS metadata URI).

Endpoints used:

- `/abi` (Contract ABI)

- `/config` (Contract address & IPFS metadata hash)

Example response (`/config`):

```json
{
	"contractAddress": "0xYourDeployedContractAddress",
	"metadataURI": "QmYourMetadataHash"
}
```

## Testing Minting Functionality

#### Smart Contract Testing (`Girl42.test.js`):

Key test cases related to minting:

- Successful minting by the owner.
- Attempting minting more than once (should revert).
- Minting attempt by non-owner (should revert).
- Minting without metadata (should revert).

Example minting test:

```javascript
it("Should mint the NFT when called by the owner", async function () {
	await girl42.mintNFT(initialOwner, ipfsURI);

	expect(await girl42.exists()).to.be.true;
	expect(await girl42.ownerOf(1)).to.equal(initialOwner);
});
```

#### Frontend Interaction Testing (Manual):

- Connect wallet and mint via frontend.
- Verify mint status and button disabling upon successful minting.

#### Security Considerations

- **Single NFT Enforcement:**
    Ensures the NFT’s uniqueness by allowing only one mint ever. (`require(!_minted, ...)`).
- Ownership Restriction (`onlyOwner`):
    Minting functionality restricted to contract owner to prevent unauthorized minting.
- Metadata Validation:
    Checks for non-empty metadata (`onChainMetadata`) to ensure NFT authenticity and correctness.

## Workflow Summary

1. **Upload Assets to IPFS**

    - Use `upload.js` to upload image and metadata.

2. **Deploy Contract**
    - Deploy the smart contract using `deploy.js`.

3. **Mint NFT**
    - Option 1: Mint immediately via script.

    - Option 2: Mint manually via the frontend.

4. **Frontend Interaction**

    - Users connect wallets and mint NFT via a web interface.

5. **Testing**

    - Run automated tests for smart contracts.

    - Perform manual frontend tests.

## Troubleshooting Minting Issues

Common issues:

- "NFT already minted": Only one NFT mint allowed; check mint status.

- "Ownable: caller is not the owner": Ensure the wallet used for minting is the contract owner.

- IPFS issues: Check Pinata dashboard for uploaded metadata.

## Usage Example

Minting via script (after deployment):

```javascript
await mintNft(deployer, Girl42);
```

Minting with frontend involves calling:
```solidity
mintNFT(recipientAddress, "ipfs://YourMetadataHash")
```

## Testing the Minting Functionality

#### Test Cases

✅ **Successful Minting by Owner**

Ensures that minting is possible only when performed by the contract owner.

```javascript
it("Should mint the NFT when called by the owner", async function () {
    await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);

    expect(await girl42.exists()).to.be.true;
    expect(await girl42.ownerOf(tokenId)).to.equal(initialOwner);
});
```

🚫 **Prevent Double Minting**

Verifies that attempting to mint the NFT more than once results in a failure, preserving the NFT’s uniqueness.

```javascript
it("Should fail if NFT is already minted", async function () {
    await girl42.mintNFT(initialOwner, ipfsURI, onChainMetadata, onChainImage);

    await expect(
        girl42.mintNFT(initialOwner, "anotherIPFS", "anotherMetadata", "anotherImage")
    ).to.be.revertedWith("NFT already minted");
});
```

🔐 **Owner-only Minting Restriction**

Tests that only the contract owner is authorized to mint the NFT, and attempts by unauthorized addresses fail.

```javascript
it("Should fail if non-owner tries to mint", async function () {
    await expect(
        girl42.connect(addr1).mintNFT(addr1.address, ipfsURI, onChainMetadata, onChainImage)
    ).to.be.revertedWithCustomError(girl42, "OwnableUnauthorizedAccount");
});
```

📝 **Validation of Minting Inputs**

Ensures minting cannot occur with empty metadata or IPFS references, maintaining NFT authenticity.

```javascript
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
```

#### Manual Frontend Testing

In addition to automated tests, manual verification via the frontend ensures seamless user experience and proper integration with the blockchain.

**Steps to manually verify minting functionality:**

1. Launch the backend server:
    ```bash
    cd website
    node server.js
    ```

2. Serve the frontend website:
    ```bash
    cd website
    http-server
    ```

3. Open the provided URL, connect MetaMask, and ensure the mint button becomes available.

4. Click **Mint NFT** and confirm the transaction in MetaMask.

5. Verify successful minting by checking:
    - Mint button is disabled.
    - Status message confirms the NFT has been minted successfully.