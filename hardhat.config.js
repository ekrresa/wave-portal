require("@nomiclabs/hardhat-waffle");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/476xvIN8hvMIHdEpkDhnoSssxVFNW5oA",
      accounts: [
        "aea73af13a3c20c265d5d2cb7e6c2e2f4e13288fcf30a5bc77a8b3d7a9b26511",
      ],
    },
  },
};
