# Deploying and minting Girl42

From an empty clone to a minted NFT on Sepolia.

## 1. Requirements

- **Node.js 20+** (the upload script relies on the global `File` class).
- An **Infura** project, for its Sepolia endpoint.
- A **Pinata** account, for IPFS uploads (you need a JWT and a gateway URL).
- A **wallet** (e.g. MetaMask) with some Sepolia ETH from a faucet. Its private key is used to deploy, and this wallet becomes the contract owner.

```bash
npm install
cp .env.example .env
```

## 2. Environment variables

| Variable | Needed for | Value |
|---|---|---|
| `PRIVATE_KEY` | every Hardhat command | Private key of the deployer/owner wallet. |
| `INFURA_ENDPOINT` | every Hardhat command | `https://sepolia.infura.io/v3/<your project id>` |
| `PINATA_JWT` | `upload.js`, `fetch.js` | Pinata API JWT. |
| `GATEWAY_URL` | `upload.js`, `fetch.js` | Your Pinata gateway domain. |
| `IPFS_HASH_METADATA` | minting, `fetch.js`, website | Metadata hash printed by `upload.js`. |
| `CONTRACT_ADDRESS` | website | Address printed by `deploy.js`. |

`PINATA_PUBLIC_KEY`, `PINATA_PRIVATE_KEY` and `IPFS_HASH_IMAGE` appear in `.env.example` but are not read by any script.

Hardhat loads the Sepolia config on every run, so `PRIVATE_KEY` and `INFURA_ENDPOINT` must be set even for `compile` and `test`. Never commit `.env`.

## 3. Compile and test

```bash
npx hardhat compile
npx hardhat test
```

`compile` also produces the ABI in `code/artifacts/`, which the website backend serves.

## 4. Upload the art to IPFS

```bash
node code/scripts/upload.js
```

This uploads `images/NFT_42.png`, builds the metadata JSON (writing a copy to `images/metadata.json`), uploads it, and prints both IPFS links. Copy the **metadata** hash into `IPFS_HASH_METADATA`.

To check the upload worked:

```bash
node code/scripts/fetch.js   # prints the metadata JSON stored at IPFS_HASH_METADATA
```

## 5. Deploy the contract

```bash
npx hardhat run --network sepolia deployment/deploy.js
```

Output:

```
Deploying the contract with account:  0x...
Girl42 contract deployed at:  0x...
```

Put the contract address in `CONTRACT_ADDRESS`, and check it on [Sepolia Etherscan](https://sepolia.etherscan.io/). Redeploying creates a new contract, so update the address each time.

## 6. Mint

Only the owner wallet can mint, and only once. Two ways:

- **From the deploy script:** uncomment `// await mintNft(deployer, Girl42);` in `deployment/deploy.js` before deploying. It mints to the deployer with `ipfs://<IPFS_HASH_METADATA>`.
- **From the website:** see below. Connect MetaMask with the **owner** wallet, otherwise the transaction reverts.

## 7. Run the website

```bash
node website/server.js        # backend on http://localhost:3000
npx http-server website       # or any static server / VS Code Live Server
```

The backend has two endpoints, used by `website/app.js`:

- `GET /abi` — the contract ABI, read from `code/artifacts/` (so compile first).
- `GET /config` — `CONTRACT_ADDRESS` and `IPFS_HASH_METADATA` from `.env`.

On the page: **Connect** MetaMask (on Sepolia), the page shows whether the token is already minted, then **Mint** sends `mintNFT(yourAddress, "ipfs://<metadata hash>")`.

## Troubleshooting

- **Hardhat config error on any command** — `.env` is missing or `PRIVATE_KEY` / `INFURA_ENDPOINT` are empty.
- **Deployment fails with insufficient funds** — get Sepolia ETH from a faucet.
- **`NFT already minted`** — the token exists; deploy a new contract if you need to mint again.
- **`OwnableUnauthorizedAccount`** — you're not using the wallet that deployed the contract.
- **Website can't load the contract** — `server.js` isn't running, the contracts aren't compiled, or `CONTRACT_ADDRESS` is outdated.
