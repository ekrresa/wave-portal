// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;
    mapping(address => uint256) public wavesPerUser;
    mapping(address => uint256) public earningsPerUser;
    mapping(address => uint256) public lastWavedAt;
    event NewWave(address indexed from, uint256 timestamp, string message);

    Wave[] waves;
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
        uint256 earnings;
    }

    constructor() payable {}

    function wave(string memory message) public {
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            'Must wait 30 seconds before waving again.'
        );

        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        wavesPerUser[msg.sender] += 1;

        uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
        seed = randomNumber;

        if (randomNumber < 50) {
            uint256 prizeAmount = 0.0001 ether;
            earningsPerUser[msg.sender] += prizeAmount;
            waves.push(Wave(msg.sender, message, block.timestamp, prizeAmount));

            require(
                prizeAmount <= address(this).balance,
                'Trying to withdraw more money than the contract has.'
            );
            (bool success, ) = (msg.sender).call{ value: prizeAmount }('');

            require(success, 'Failed to withdraw money from contract.');
        } else {
            waves.push(Wave(msg.sender, message, block.timestamp, 0));
        }

        emit NewWave(msg.sender, block.timestamp, message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalEarningsByUser() public view returns (uint256) {
        return earningsPerUser[msg.sender];
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getTotalWavesByUser() public view returns (uint256) {
        return wavesPerUser[msg.sender];
    }
}
