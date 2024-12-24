window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        window.web3 = new Web3(window.ethereum);
    } else {
        alert('Please install MetaMask to use this feature.');
        return;
    }

    const connectButton = document.getElementById('connectButton');
    const mintButton = document.getElementById('mintButton');
    const walletAddressDiv = document.getElementById('walletAddress');
    const statusDiv = document.getElementById('status');

    let accounts = [];

    // Connect to MetaMask
    connectButton.addEventListener('click', async () => {
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            walletAddressDiv.innerText = `Connected wallet: ${walletAddress}`;
            mintButton.disabled = false;
        } catch (error) {
            console.error('User denied account access', error);
            statusDiv.innerText = 'Failed to connect wallet.';
        }
    });

    // Mint NFT
    mintButton.addEventListener('click', async () => {
        if (accounts.length === 0) {
            statusDiv.innerText = 'Please connect your wallet first.';
            return;
        }

        try {
            // Fetch ABI and contract details from backend
            const artifact = await fetch('http://localhost:3000/abi').then(res => res.json());
            const config = await fetch('http://localhost:3000/config').then(res => res.json());

            const contractABI = artifact.abi;
            const contractAddress = config.contractAddress;
            const metadataURI = `ipfs://${config.metadataURI}`;

            const girl42Contract = new window.web3.eth.Contract(contractABI, contractAddress);

            const recipient = accounts[0];

            const mintTx = await girl42Contract.methods.mintNFT(recipient, metadataURI).send({ from: recipient });
            console.log('Transaction successful:', mintTx);
            statusDiv.innerText = 'NFT minted successfully!';
        } catch (error) {
            console.error('Error minting NFT:', error);
            statusDiv.innerText = 'Failed to mint NFT.';
        }
    });
});
