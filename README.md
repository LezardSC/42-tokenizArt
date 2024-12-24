`npm init`
`npm install hardhat`
`npx hardhat` (Javascript project, yes to everything)
`npm install ethers`
`npm install @nomiclabs/hardhat-etherscan`
`npm install @openzeppelin/contracts`
`npm install dotenv`
`npm install express`

`npm install pinata-web3`

(Node version >= 20)
`node code/scripts/upload.js`

`npx hardhat compile`
`npx hardhat run --network sepolia deployment/deploy.js`

`cd website`
`node server.js`
`npm install cors`
`http-server`

used 'https://www.pngtosvg.com/' to turn the image into a svg.
https://svgomg.net/


ipfs extension:
'https://github.com/ipfs/ipfs-companion'

standard https://eips.ethereum.org/EIPS/eip-721

standard json:
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents"
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents"
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive."
        }
    }
}