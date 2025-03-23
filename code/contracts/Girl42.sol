// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Girl42 is ERC721, Ownable {
	using Strings for uint256;

	string private _metadataIPFS;
	bool private _minted;

	constructor(
		string memory name,
		string memory symbol,
		address initialOwner
	) ERC721(name, symbol) Ownable(initialOwner) {
		transferOwnership(initialOwner);
	}

	function mintNFT(
		address recipient,
		string memory onChainMetadata
	) public onlyOwner {
		require(!_minted, "NFT already minted");
		require(bytes(onChainMetadata).length > 0, "On-chain metadata cannot be empty");
		
		_mint(recipient, 1); // Mint the token with a fixed ID of 1
		_minted = true;
		_metadataIPFS = onChainMetadata;
	}

    function tokenURI(uint256 tokenId) public view override
	  returns (string memory) {
		require(tokenId == 1, "Only one NFT exists with ID 1.");
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
		return _metadataIPFS;
    }

    function exists() public view returns (bool) {
        return _minted;
    }

    function getOnChainMetadata() public view returns (string memory) {
        require(_ownerOf(1) != address(0), "Token does not exist");
        return _metadataIPFS;
    }

    function updateOnChainMetadata(string memory newMetadata) public onlyOwner {
        require(_ownerOf(1) != address(0), "Token does not exist");
        _metadataIPFS = newMetadata;
    }
}
