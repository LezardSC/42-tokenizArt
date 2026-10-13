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
| `GATEWAY_URL` | `upload.js`, `fetch.js`, website | Your Pinata gateway domain. The website tries it first, then public gateways. |
| `IPFS_HASH_METADATA` | minting, `fetch.js`, website | Metadata hash printed by `upload.js`. |
| `CONTRACT_ADDRESS` | website | Address printed by `deploy.js`. |
| `CHAIN_ID` | website (optional) | Network the contract is on. Defaults to `11155111` (Sepolia); `31337` for a local Hardhat node. |

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
- `GET /config` — `CONTRACT_ADDRESS`, `IPFS_HASH_METADATA`, `CHAIN_ID` and `GATEWAY_URL` from `.env`.

On the page:

- The page reads the contract through MetaMask as soon as it loads, no connection needed. If the token is minted, it shows it: `tokenURI(1)` is read from the chain, then the metadata and the image are fetched from IPFS, along with the current owner.
- If MetaMask is on another network, the page says so and offers to switch.
- **Connect** MetaMask. If the token isn't minted and you are the contract owner, **Mint** sends `mintNFT(yourAddress, "ipfs://<metadata hash>")`. The page shows the transaction while it is pending (with an Etherscan link on Sepolia), then reveals the NFT once it is mined.

## 8. Trying it on a local node (optional)

To test the full flow without spending Sepolia ETH, or as many times as you need (the token can only be minted once per contract):

```bash
npx hardhat node                                          # terminal 1: local chain on http://127.0.0.1:8545
npx hardhat run --network localhost deployment/deploy.js  # terminal 2
```

Then set `CONTRACT_ADDRESS` to the printed address and `CHAIN_ID=31337`, and start the website as above. In MetaMask, add the network `http://127.0.0.1:8545` (chain ID `31337`) and import **Account #0** from the keys printed by `hardhat node`: it is the deployer, so it owns the contract. The metadata and image still come from IPFS.

Restarting `hardhat node` wipes the chain, so redeploy after each restart. If MetaMask then complains about nonces, clear its activity data for that account (*Settings → Advanced → Clear activity tab data*).

## Troubleshooting

- **Hardhat config error on any command** — `.env` is missing or `PRIVATE_KEY` / `INFURA_ENDPOINT` are empty.
- **Deployment fails with insufficient funds** — get Sepolia ETH from a faucet.
- **`NFT already minted`** — the token exists; deploy a new contract if you need to mint again.
- **`OwnableUnauthorizedAccount`** — you're not using the wallet that deployed the contract.
- **Website can't load the contract** — `server.js` isn't running, the contracts aren't compiled, or `CONTRACT_ADDRESS` is outdated.
- **"Artwork unavailable"** — every IPFS gateway failed. The image is large (~15 MB), so public gateways can be slow; setting `GATEWAY_URL` to your Pinata gateway helps.
