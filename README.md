# Girl42

Second project in the blockchain branch of 42 School. The aim of the project is to create its own Non Fungible Token (NFT) on the Ethereum blockchain.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Design Choices and Rationale](#design-choices-and-rationale)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Dependencies](#dependencies)
- [Creating the NFT](#creating-the-nft)
- [IPFS Integration](#ipfs-integration)
- [Website Interaction](#website-interaction)
- [More documentation](#more-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Introduction

TokenizArt is a blockchain-based project created for the 42 School blockchain curriculum. The goal is to create, deploy, and manage a unique ERC721 NFT on Ethereum’s Sepolia test network. The NFT, named Girl42, uses decentralized storage (IPFS via Pinata) to host images and metadata.
The artist that designed the NFT is [Horzeau](https://x.com/Horzeau).

## Key Features

- **ERC721 Compliance**: Standard Ethereum NFT.
- **Decentralized Storage**: Uses IPFS for NFT images and metadata.
- **Single NFT Mint**: Restricts minting to only one unique token.
- **Metadata Management**: Ability to securely update metadata via the contract owner.
- **Hardhat Development Environment**: Compilation, deployment, and testing via Hardhat.


## Design Choices and Rationale

#### Use of Ethereum Blockchain

I chose the Ethereum blockchain as the foundation for Girl42 due to its robust smart contract capabilities and widespread adoption. Ethereum's mature ecosystem provides a secure and decentralized platform for deploying smart contracts. It is particularly suited for NFT projects as it provides transparent, secure, and decentralized smart contract functionality.

#### Solidity for Smart Contract Development

Solidity was selected as the programming language for developing the smart contract because it's the primary language for writing smart contracts on Ethereum. Its syntax similar to JavaScript and C++, making it accessible for developers. Its capabilities align closely with the project's requirements, enabling efficient and secure implementation of ERC721 standards and the necessary logic for minting and metadata management

#### Deployment on Sepolia Test Network

I opted to deploy and test the contract on the Sepolia test network. Sepolia is a public Ethereum testnet that simulates the main network's environment without the associated costs and risks. This allows us to thoroughly test the contract's functionality, security and performance in a realistic setting. Using Sepolia helps identify and resolve issues early in the development process.

#### ERC721 Standard with OpenZeppelin Libraries

The ERC721 standard was selected because it is the widely accepted Ethereum standard for NFTs, offering broad compatibility across NFT marketplaces, wallets, and decentralized applications. To ensure reliability, security, and compliance, I leveraged OpenZeppelin's implementation of ERC721. OpenZeppelin contracts are well-audited and provide a robust foundation, significantly reducing the potential for security vulnerabilities and streamlining the development process.

#### Development with Hardhat

Hardhat was chosen as the development environment for its flexibility and powerful features. It provides a rich set of tools for compiling, testing, and deploying smart contracts. Hardhat's extensible plugin system and comprehensive debugging capabilities enhance development workflow. It allows us to write automated tests, simulate blockchain environments, and ensure that the contract behaves as expected under various scenarios.

I updated paths in `hardhat.config.js` to organize files properly, maintaining a clean and structured project layout. The main reason, of course, is to meet the project requirements.

#### Infura as Provider

To interact with the Ethereum blockchain, I use Infura, a trusted Ethereum infrastructure provider. Infura allows us to deploy and interact with the Girl42 smart contract on the Sepolia testnet without running a full Ethereum node. Its reliability and ease of use make it an excellent choice for Ethereum-based projects.

To set up the project, you'll need an Infura API key to connect to the Sepolia network. You can obtain one by creating an account on [Infura](https://www.infura.io/). Ensure that your .env file includes your Infura project ID as shown below:

```plaintext
	INFURA_SEPOLIA_ENDPOINT = 'https://sepolia.infura.io/v3/YOUR_TOKEN'
```

#### Metadata Management via IPFS (Pinata)
To address decentralized storage of the NFT metadata and associated image, IPFS (InterPlanetary File System) was selected as a distributed file storage system, with Pinata as the service provider. This ensures that the Girl42 NFT metadata and image remain immutable, accessible, and tamper-proof, aligning with decentralization principles and enhancing trust in asset permanence.

#### Pinata SDK Integration
I integrated Pinata SDK (pinata-web3) to facilitate seamless uploading and retrieval of assets and metadata on IPFS. Pinata was chosen due to its ease of use, reliability, and comprehensive documentation, enabling efficient integration with Node.js scripts to automate asset management tasks.

#### Express.js Backend for ABI and Contract Configuration

To simplify and secure interaction between the frontend web application and the deployed smart contract, an Express.js backend was implemented. It serves critical configuration details such as the contract ABI and address securely via an API endpoint. This ensures a clean separation of concerns and enhances frontend flexibility by centralizing configuration data in one manageable location.

#### Simple Frontend with Web3.js and MetaMask Integration

The frontend website was designed with simplicity and user-friendliness in mind. It utilizes basic HTML, CSS, and JavaScript alongside Web3.js to enable wallet connection and NFT minting directly from the browser. Integration with MetaMask ensures a smooth, secure experience for users, who can easily connect their Ethereum wallet and mint the NFT with just a few clicks.

#### Single NFT Minting Restriction
A design choice was made to restrict the Girl42 contract to minting only a single NFT. This decision was motivated by the project's requirement to create a unique, exclusive digital asset, emphasizing rarity and value. By enforcing a single mint through the smart contract, we ensure the exclusivity and integrity of the Girl42 NFT.


## Project Structure

```
.
├── code/
│   ├── artifacts/
│   ├── cache/
│   ├── contracts/
│       └── Girl42.sol
│   └── tests/
│       └── Girl42.test.js
├── deployment/
│   └── deploy.js
├── images/
│   ├── NFT_42.png
│   └── metadata.json
├── documentation/
├── scripts/
│   ├── upload.js
│   └── fetch.js
├── website/
│   ├── app.js
│   ├── server.js
│   ├── index.html
│   ├── styles.css
│   ├── favicon.ico
│   └── placeholder.png
├── README.md
├── hardhat.config.js
├── package-lock.json
├── package.json
└── .env
```

## Setup Instructions

#### Prerequisites

- **Node.js**: Versions 16.0.0 or higher (v20.9.0 recommended to avoid unexpected behaviour, but every recent version should works).
- **npm**: Comes with Node.js
- **Git**: For version control.
- **Hardhat**: In order to deploy the contract.
- **MetaMask Wallet**: or any other wallet. Recommended but not mandatory, as a private key is required in order to deploy the contract or mint the NFT.
- **An Infura account**: or any other providers. You will need to update the hardhat configs if you decide to use something else than Infura. Required for connecting to the Sepolia test network.
- **A Pinata account**: for the IPFS integration.

#### Installation Steps

1. **Clone the repository**
```bash
	git clone <repository-url>
	cd tokenizart
```

2. **Install Dependencies**
```bash
npm init
npm install
npm install @openzeppelin/contracts
```

- If npm didn't installed everything, here's all the dependencies:
    ```bash
	npm install @openzeppelin/contracts hardhat ethers @nomiclabs/hardhat-etherscan dotenv express pinata-web3 cors
    ```

3. **Create an Environment File**
- Create a `.env` file in the root directory.
- Add necessary environment variables. You can find a template in the `.env.example` file.

4. **Compile the Contracts**
```bash
	npx hardhat compile
```

5. **Run Tests**
```bash
	npx hardhat test
```

6. **Deploy to Sepolia Network**
```bash
	npx hardhat run --network sepolia deployment/scripts/deploy.js
```

7. **Update Contract Address**
- After deployment, update the contract address in the `.env` file.
- Ensure you update this address every time you redeploy the contract.


## Dependencies

- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts.
- **@openzeppelin/contracts**: Secure ERC721 and Ownable implementations.
- **pinata-web3**: IPFS integration.
- **dotenv**: Environment variable management.
- **Express.js & cors**: For the frontend web application.


## Creating the NFT

#### Image & Metadata

Upload the image to IPFS using `upload.js`. This script uploads the image and creates metadata JSON with essential details including name, description, and artist info, then uploads the metadata to IPFS.

```bash
node code/scripts/upload.js
```

## IPFS Integration

Girl42 NFT metadata and images are hosted using IPFS decentralized storage, provided through Pinata.

- **Upload**: `upload.js` is used to easily upload images and metadata to IPFS.

- **Fetch**: `fetch.js` verifies successful uploads and ensures metadata availability.

For easier IPFS management, consider using the [IPFS Companion browser extension](https://github.com/ipfs/ipfs-companion).


## Website Interaction

The project includes a simple frontend website built with HTML, CSS, JavaScript, and Web3.js, integrated with MetaMask to allow users to:

- **Connect wallet**: Securely connect to Ethereum wallet (MetaMask recommended).

- **Mint NFT**: Interact with the deployed smart contract to mint the unique Girl42 NFT.

- **View NFT status**: Instantly check if the NFT is available or already minted.

#### Running the Website Locally:

Start the backend server (for ABI and configuration):

```bash
cd website
node server.js
```

Then serve your frontend (recommended using http-server):

```bash
cd website
http-server
```

Open your browser and navigate to the provided local URL.


## More Documentation

For a deeper dive into Girl42, [check the full project documentation](/documentation/).


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure that all tests pass and adhere to the project's coding standards.


## License

This project is part of the **42 School curriculum** and follows its evaluation and submission guidelines.


## Author

login: jrenault

author of the NFT art: [Horzeau](https://x.com/Horzeau)