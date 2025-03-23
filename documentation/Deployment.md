# Deployment Documentation

## Overview

Deployment covers the process of deploying the Girl42 NFT smart contract onto the Ethereum Sepolia test network, using the Hardhat development environment and Infura as the Ethereum node provider.

## Smart Contract Deployment (`deploy.js`)

#### Deployment Script Workflow:

- Connects to Ethereum using Hardhat and deployer's wallet.
- Deploys the `Girl42` smart contract to the Sepolia testnet.
- Verifies successful deployment and retrieves contract address.

#### Detailed Steps:

1. **Initialization**

Load dependencies and environment variables:

```javascript
const hre = require("hardhat");
require("dotenv").config();
```

2. **Contract Deployment**

Deploys the smart contract using deployer's wallet credentials:

```javascript
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

    const address = await Girl42.getAddress();
    console.log("Girl42 contract deployed at: ", address);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
```

#### Deployment Configuration (Hardhat)

Your Hardhat configuration specifies the Solidity compiler version and sets paths and network details.

`hardhat.config.js`

```javascript
module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./code/contracts",
    tests: "./code/tests",
    cache: "./code/cache",
    artifacts: "./code/artifacts"
  },
  networks: {
    sepolia: {
      url: process.env.INFURA_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

- **Paths:** Organizes project files clearly according to the 42 project standard.
- **Networks:** Uses the Sepolia network via Infura as specified in environment variables.

#### Environment Setup (Infura & Wallet)

Ensure your `.env` file includes Infura and wallet private key details:

```plaintext
INFURA_ENDPOINT=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
```
- **Infura:** Provides Ethereum node access without running a full node.

- **Wallet (Private Key):** Used to deploy the contract; keep private keys secure and confidential.

## Deployment Commands

Run these commands sequentially in your terminal to deploy:

1. **Compile the Contract**

```bash
npx hardhat compile
```

2. **Deploy the Contract**

```bash
npx hardhat run --network sepolia deployment/deploy.js
```
- The script logs the deployed contract’s address upon successful deployment.

## Verifying Deployment

To verify the deployment, note the contract address provided by the deployment script output:

```plaintext
Deploying the contract with account: 0xYourDeployerAddress
Girl42 contract deployed at: 0xYourContractAddress
```

Verify the deployment on [Sepolia Etherscan](https://sepolia.etherscan.io/) by pasting the deployed contract address.

## Post-Deployment Steps

After deploying, it's important to:

1. Update the `.env` file with the newly deployed contract address for the website interaction:

```plaintext
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

2. Verify contract functionality by interacting with the frontend website.

## Testing the Deployment

Your test suite includes automated checks to verify successful deployment:

✅ **Contract Owner is Correctly Set**

Ensures the contract ownership matches the deployer's wallet address:

```javascript
it("Should set the correct owner", async function () {
    expect(await girl42.owner()).to.equal(initialOwner);
});
```

✅ **Correct Contract Initialization**

Checks that the deployed contract has the correct NFT name and symbol:

```javascript
it("Should have the correct name and symbol", async function () {
    expect(await girl42.name()).to.equal(name);
    expect(await girl42.symbol()).to.equal(symbol);
});
```

🚫 **Preventing Premature Token Queries**

Ensures the token does not exist prematurely after deployment:

```javascript
it("Should not have the token minted yet", async function () {
    expect(await girl42.exists()).to.be.false;
    await expect(girl42.tokenURI(tokenId))
        .to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
});
```

## Security Considerations

- **Secure Private Keys:** Store wallet private keys safely; never expose them publicly.

- **Infura API Key:** Securely store Infura API keys; avoid committing them to version control.

- **Deployment Confirmation:** Always verify the deployed contract address independently on blockchain explorers.

## Common Issues & Troubleshooting

- **Deployment Failure (Incorrect Funds):** Ensure your Sepolia wallet has sufficient ETH (available via faucets).

- **Network Connectivity Errors:** Confirm Infura credentials and endpoint correctness in `.env`.