require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
  solidity: '0.8.4',
  networks: {
    development: {
      url: 'http://127.0.0.1:8545/',
      accounts: ['0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'],
    },
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
