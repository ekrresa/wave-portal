// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
    uint256 totalWaves;
    mapping(address => uint256) wavers;
    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    Wave[] waves;

    constructor() {}

    function wave(string memory message) public {
        totalWaves += 1;
        wavers[msg.sender] += 1;

        waves.push(Wave(msg.sender, message, block.timestamp));

        emit NewWave(msg.sender, block.timestamp, "Hello Stranger");

        console.log("%s has waved!", msg.sender);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}