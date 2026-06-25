// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;

    uint256 public totalVotes;

    event Voted(
        address indexed voter,
        uint256 indexed candidateId
    );

    function vote(uint256 candidateId) external {
        require(!hasVoted[msg.sender], "Already voted");

        require(
            candidateId >= 1 && candidateId <= 3,
            "Invalid candidate"
        );

        hasVoted[msg.sender] = true;

        votes[candidateId]++;
        totalVotes++;

        emit Voted(msg.sender, candidateId);
    }
}