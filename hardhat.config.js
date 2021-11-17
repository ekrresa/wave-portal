require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
  solidity: '0.8.4',
  networks: {
    development: {
      url: 'http://127.0.0.1:8545/',
      chainId: 1337,
      accounts: ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
    },
    hardhat: {
      chainId: 1337,
    },
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
