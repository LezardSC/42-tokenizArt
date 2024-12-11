// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Girl42 is ERC721 {
	constructor(string memory name, string memory symbol)
		ERC721(name, symbol) {

	}
}
