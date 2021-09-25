// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
    uint256 totalWaves;
    mapping(address => uint256) wavers;
    event tidalWave(address _from, string _message);

    constructor() {
        console.log("Hi I'm Chukky, I'm a smart contract!");
    }

    function wave() public {
        totalWaves += 1;
        wavers[msg.sender] += 1;

        emit tidalWave(msg.sender, "Hello Stranger");

        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}