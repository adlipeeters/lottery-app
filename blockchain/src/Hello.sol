// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Hello {
    //Emitted when update function is called
    //Smart contract events are a way for your contract to communicate that something happened on the blockchain to your app front-end, which can be 'listening' for certain events and take action when they happen.
    event UpdatedMessages(string oldStr, string newStr, uint256 updateCount);

    // Declares a state variable `message` of type `string`.
    // State variables are variables whose values are permanently stored in contract storage. The keyword `public` makes variables accessible from outside a contract and creates a function that other contracts or clients can call to access the value.
    string public message;

    uint256 updateCount = 0;

    // array for storing wallet

    // Similar to many class-based object-oriented languages, a constructor is a special function that is only executed upon contract creation.
    // Constructors are used to initialize the contract's data. Learn more:https://solidity.readthedocs.io/en/v0.5.10/contracts.html#constructors
    constructor(string memory initMessage) {
        // Accepts a string argument `initMessage` and sets the value into the contract's `message` storage variable).
        message = initMessage;
    }

    // A public function that accepts a string argument and updates the `message` storage variable.
    function update(string memory newMessage) public {
        string memory oldMsg = message;
        message = newMessage;
        updateCount++;
        emit UpdatedMessages(oldMsg, newMessage, updateCount);
    }

    // return the value of the `message` storage variable
    function retrieve() public view returns (string memory) {
        return message;
    }
}
