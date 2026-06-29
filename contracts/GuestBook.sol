// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GuestBook {

    event MessagePosted(
        address indexed author,
        string message
    );

    function postMessage(string calldata message) external {
        emit MessagePosted(msg.sender, message);
    }
}