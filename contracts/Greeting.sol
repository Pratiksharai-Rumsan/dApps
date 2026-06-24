// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Greeting {
    string public greeting = "Hello Blockchain";

    event GreetingUpdated(string oldGreeting, string newGreeting, address updatedBy);

    function setGreeting(string memory _greeting) public {
        emit GreetingUpdated(greeting, _greeting, msg.sender);
        greeting = _greeting;
    }

    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}