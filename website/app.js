const BACKEND_URL = 'http://localhost:3000';

const NETWORKS = {
    11155111: { name: 'Sepolia', explorer: 'https://sepolia.etherscan.io' },
    31337: { name: 'Hardhat local', explorer: null },
};

const PUBLIC_GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
];

const connectButton = document.getElementById('connectButton');
const switchButton = document.getElementById('switchButton');
const mintButton = document.getElementById('mintButton');
const networkBadge = document.getElementById('networkBadge');
const walletAddress = document.getElementById('walletAddress');
const statusDiv = document.getElementById('status');
const artFrame = document.getElementById('artFrame');
const placeholder = document.getElementById('placeholder');
const placeholderText = document.getElementById('placeholderText');
const nftImage = document.getElementById('nftImage');
const nftDetails = document.getElementById('nftDetails');
const contractInfo = document.getElementById('contractInfo');

let config;
let girl42Contract;
let account = null;
let gateways = PUBLIC_GATEWAYS;

function shortAddress(address) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function explorerUrl(kind, value) {
    const network = NETWORKS[config.chainId];
    return network && network.explorer ? `${network.explorer}/${kind}/${value}` : null;
}

function link(text, href) {
    if (!href) {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
    }
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
}

function setStatus(text, { kind = 'info', linkText, href } = {}) {
    statusDiv.className = `status status-${kind}`;
    statusDiv.replaceChildren(text);
    if (linkText && href) {
        statusDiv.append(' ', link(linkText, href));
    }
}

function ipfsToGateways(uri) {
    const path = uri.replace(/^ipfs:\/\//, '');
    return gateways.map(gateway => gateway + path);
}

async function fetchFromIpfs(uri) {
    for (const url of ipfsToGateways(uri)) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                return { data: await res.json(), url };
            }
        } catch (error) {
            console.warn(`Gateway failed: ${url}`, error);
        }
    }
    throw new Error(`Could not fetch ${uri} from any gateway`);
}

function loadImage(uri) {
    const urls = ipfsToGateways(uri);
    return new Promise((resolve, reject) => {
        let i = 0;
        nftImage.onload = () => resolve();
        nftImage.onerror = () => {
            i++;
            if (i < urls.length) {
                nftImage.src = urls[i];
            } else {
                reject(new Error(`Could not load ${uri} from any gateway`));
            }
        };
        nftImage.src = urls[0];
    });
}

function showPlaceholder(text) {
    placeholderText.textContent = text;
    placeholder.hidden = false;
    nftImage.hidden = true;
    nftDetails.hidden = true;
    artFrame.classList.remove('revealed');
}

async function showMintedNFT() {
    const [owner, tokenURI] = await Promise.all([
        girl42Contract.methods.ownerOf(1).call(),
        girl42Contract.methods.tokenURI(1).call(),
    ]);

    showPlaceholder('Loading artwork from IPFS…');
    artFrame.classList.add('loading');

    try {
        const { data: metadata, url: metadataUrl } = await fetchFromIpfs(tokenURI);

        document.getElementById('nftName').textContent = metadata.name;
        document.getElementById('nftDescription').textContent = metadata.description;
        document.getElementById('nftOwner').replaceChildren(link(shortAddress(owner), explorerUrl('address', owner)));
        document.getElementById('nftMetadata').replaceChildren(link(tokenURI, metadataUrl));

        await loadImage(metadata.image);
        placeholder.hidden = true;
        nftImage.hidden = false;
        nftDetails.hidden = false;
        // Next frame, so the reveal transition runs
        requestAnimationFrame(() => artFrame.classList.add('revealed'));
        return true;
    } catch (error) {
        console.error('Error loading the NFT from IPFS:', error);
        showPlaceholder('Artwork unavailable');
        setStatus('The NFT is minted, but its artwork could not be loaded from IPFS.', { kind: 'error' });
        return false;
    } finally {
        artFrame.classList.remove('loading');
    }
}

async function refresh() {
    mintButton.disabled = true;
    try {
        const isMinted = await girl42Contract.methods.exists().call();
        if (isMinted) {
            mintButton.hidden = true;
            setStatus('This NFT has been minted.', { kind: 'success' });
            await showMintedNFT();
            return;
        }

        mintButton.hidden = false;
        showPlaceholder('Not minted yet');
        if (!account) {
            setStatus('The NFT is available. Connect the owner wallet to mint it.');
            return;
        }

        const owner = await girl42Contract.methods.owner().call();
        if (owner.toLowerCase() !== account.toLowerCase()) {
            setStatus('Only the contract owner can mint this NFT.', { kind: 'error' });
            return;
        }

        mintButton.disabled = false;
        setStatus('The NFT is available for minting.');
    } catch (error) {
        console.error('Error reading the contract:', error);
        setStatus('Failed to read the contract. Is CONTRACT_ADDRESS deployed on this network?', { kind: 'error' });
    }
}

function setAccount(accounts) {
    account = accounts.length > 0 ? accounts[0] : null;
    walletAddress.hidden = !account;
    connectButton.hidden = Boolean(account);
    if (account) {
        walletAddress.textContent = shortAddress(account);
        walletAddress.title = account;
    }
}

async function checkNetwork() {
    const chainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
    const current = NETWORKS[chainId];
    const expected = NETWORKS[config.chainId];
    const ok = chainId === config.chainId;

    networkBadge.hidden = false;
    networkBadge.textContent = current ? current.name : `Chain ${chainId}`;
    networkBadge.classList.toggle('badge-error', !ok);
    switchButton.hidden = ok;

    if (!ok) {
        mintButton.disabled = true;
        showPlaceholder('Wrong network');
        setStatus(`Please switch your wallet to ${expected ? expected.name : `chain ${config.chainId}`}.`, { kind: 'error' });
    }
    return ok;
}

function showContractInfo() {
    contractInfo.replaceChildren(
        'Contract ',
        link(config.contractAddress, explorerUrl('address', config.contractAddress))
    );
}

connectButton.addEventListener('click', async () => {
    try {
        setAccount(await window.ethereum.request({ method: 'eth_requestAccounts' }));
        if (await checkNetwork()) {
            await refresh();
        }
    } catch (error) {
        console.error('User denied account access', error);
        setStatus('Failed to connect wallet.', { kind: 'error' });
    }
});

switchButton.addEventListener('click', async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${config.chainId.toString(16)}` }],
        });
    } catch (error) {
        console.error('Network switch failed', error);
        setStatus('Could not switch network. Please do it from your wallet.', { kind: 'error' });
    }
});

mintButton.addEventListener('click', async () => {
    mintButton.disabled = true;
    setStatus('Confirm the transaction in your wallet…', { kind: 'pending' });

    try {
        const metadataURI = `ipfs://${config.metadataURI}`;
        const receipt = await girl42Contract.methods.mintNFT(account, metadataURI)
            .send({ from: account })
            .on('transactionHash', hash => {
                artFrame.classList.add('loading');
                setStatus('Transaction pending…', {
                    kind: 'pending',
                    linkText: shortAddress(hash),
                    href: explorerUrl('tx', hash),
                });
            });

        console.log('Transaction successful:', receipt);
        mintButton.hidden = true;
        setStatus(`NFT minted in block ${receipt.blockNumber}.`, {
            kind: 'success',
            linkText: 'View transaction',
            href: explorerUrl('tx', receipt.transactionHash),
        });
        await showMintedNFT();
    } catch (error) {
        console.error('Error minting NFT:', error);
        artFrame.classList.remove('loading');
        const rejected = error.code === 4001;
        setStatus(rejected ? 'Transaction rejected.' : 'Failed to mint NFT.', { kind: 'error' });
        mintButton.disabled = false;
    }
});

window.addEventListener('load', async () => {
    if (typeof window.ethereum === 'undefined') {
        connectButton.disabled = true;
        showPlaceholder('No wallet found');
        setStatus('Please install MetaMask to use this page.', { kind: 'error' });
        return;
    }
    window.web3 = new Web3(window.ethereum);

    try {
        const [artifact, backendConfig] = await Promise.all([
            fetch(`${BACKEND_URL}/abi`).then(res => res.json()),
            fetch(`${BACKEND_URL}/config`).then(res => res.json()),
        ]);
        config = backendConfig;
        if (config.gatewayUrl) {
            gateways = [config.gatewayUrl, ...PUBLIC_GATEWAYS];
        }
        girl42Contract = new window.web3.eth.Contract(artifact.abi, config.contractAddress);
    } catch (error) {
        console.error('Error loading contract details:', error);
        connectButton.disabled = true;
        showPlaceholder('Backend unreachable');
        setStatus('Could not reach the backend. Is website/server.js running?', { kind: 'error' });
        return;
    }

    showContractInfo();
    window.ethereum.on('accountsChanged', async accounts => {
        setAccount(accounts);
        if (await checkNetwork()) {
            await refresh();
        }
    });
    window.ethereum.on('chainChanged', () => window.location.reload());

    setAccount(await window.ethereum.request({ method: 'eth_accounts' }));
    if (await checkNetwork()) {
        await refresh();
    }
});
