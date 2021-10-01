// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;
    mapping(address => uint256) public wavers;
    mapping(address => uint256) public lastWavedAt;
    event NewWave(address indexed from, uint256 timestamp, string message);

    Wave[] waves;
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    constructor() payable {}

    function wave(string memory message) public {
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            'Must wait 30 seconds before waving again.'
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        wavers[msg.sender] += 1;

        waves.push(Wave(msg.sender, message, block.timestamp));
        console.log('%s has waved!', msg.sender);

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;

        seed = randomNumber;

        if (randomNumber < 50) {
            console.log('%s won!', msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                'Trying to withdraw more money than the contract has.'
            );
            (bool success, ) = (msg.sender).call{ value: prizeAmount }('');
            require(success, 'Failed to withdraw money from contract.');
        }

        emit NewWave(msg.sender, block.timestamp, 'Hello Stranger');
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }
}
