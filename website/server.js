const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve the ABI
app.get('/abi', (req, res) => {
    const abiPath = path.join(__dirname, '../code/artifacts/code/contracts/Girl42.sol/Girl42.json');
    try {
        const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        res.json({ abi: artifact.abi });
    } catch (error) {
        console.error('Error reading ABI file:', error);
        res.status(500).send('Unable to load ABI');
    }
});

// Serve contract address and metadata URI from environment variables
app.get('/config', (req, res) => {
    res.json({
        contractAddress: process.env.CONTRACT_ADDRESS,
        metadataURI: process.env.IPFS_HASH_METADATA,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
