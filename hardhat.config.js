require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./code/contracts",
    tests: "./code/tests",
    cache: "./code/cache",
    artifacts: "./code/artifacts"
  },
  networks: {
    sepolia: {
      url: process.env.INFURA_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
