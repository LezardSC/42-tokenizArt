// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Girl42 is ERC721, Ownable {
	using Strings for uint256;

	struct NFTMetadata {
		string ipfsURI;
		string onChainMetadata;
		string onChainImage;
	}

	NFTMetadata private _metadata;
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
		string memory ipfsURI,
		string memory onChainMetadata,
		string memory onChainImage
	) public onlyOwner {
		require(!_minted, "NFT already minted");
		require(bytes(ipfsURI).length > 0, "IPFS URI cannot be empty");
		require(bytes(onChainMetadata).length > 0, "On-chain metadata cannot be empty");
		require(bytes(onChainImage).length > 0, "On-chain image cannot be empty");
		
		_mint(recipient, 1); // Mint the token with a fixed ID of 1
		_minted = true;

		_metadata = NFTMetadata({
			ipfsURI: ipfsURI,
			onChainMetadata: onChainMetadata,
			onChainImage: onChainImage
		});
	}

    function tokenURI(uint256 tokenId) public view override
	  returns (string memory) {
		require(tokenId == 1, "Only one NFT exists with ID 1.");
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
		    return string(
				abi.encodePacked(
					'{"name":"',
					name(),
					'", "description":"On-chain and IPFS stored NFT", "image":"',
					_metadata.onChainImage,
					'", "metadata":"',
					_metadata.onChainMetadata,
					'", "external_url":"',
					_metadata.ipfsURI,
					'"}'
				)
        );
    }

	    /// @dev Check if the token exists
    function exists() public view returns (bool) {
        return _minted;
    }

    /// @dev Getters for specific fields
    function getIPFSURI() public view returns (string memory) {
        require(_ownerOf(1) != address(0), "Token does not exist");
        return _metadata.ipfsURI;
    }

    function getOnChainMetadata() public view returns (string memory) {
        require(_ownerOf(1) != address(0), "Token does not exist");
        return _metadata.onChainMetadata;
    }

    function getOnChainImage() public view returns (string memory) {
        require(_ownerOf(1) != address(0), "Token does not exist");
        return _metadata.onChainImage;
    }

    function updateIPFSURI(string memory newIPFSURI) public onlyOwner {
        require(_ownerOf(1) != address(0), "Token does not exist");
        _metadata.ipfsURI = newIPFSURI;
    }

    function updateOnChainMetadata(string memory newMetadata) public onlyOwner {
        require(_ownerOf(1) != address(0), "Token does not exist");
        _metadata.onChainMetadata = newMetadata;
    }

    function updateOnChainImage(string memory newImage) public onlyOwner { // Updater for image data
        require(_ownerOf(1) != address(0), "Token does not exist");
        _metadata.onChainImage = newImage;
    }

    function updateMetadata(
        string memory newIPFSURI,
        string memory newMetadata,
        string memory newImage
    ) public onlyOwner {
        require(_minted, "Token does not exist");

		// Update only if the new value is not empty
		if (bytes(newIPFSURI).length > 0) {
			_metadata.ipfsURI = newIPFSURI;
		}

		if (bytes(newMetadata).length > 0) {
			_metadata.onChainMetadata = newMetadata;
		}

		if (bytes(newImage).length > 0) {
			_metadata.onChainImage = newImage;
		}
    }
}
