//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract DocStamp {
    /**
        @dev keccak256 hash to user address mapping
     */
    mapping(bytes32 => address) public docHashes; // we already have getter

    event DocRegistered(bytes32 hash, address author);
    event DocUnregistered(bytes32 hash);

    error NotAuthorized();
    error AlreadyRegistered(bytes32 docHash, address author);

    constructor() {}

    function register(bytes32 hash, address author) public {
        if (docHashes[hash] != address(0)) {
            // if hash is already registered
            revert AlreadyRegistered(hash, docHashes[hash]); // throw error
        }
        docHashes[hash] = author; //set author
        emit DocRegistered(hash, author); // emit event
    }


    function unregister(bytes32 hash) public {
        if (docHashes[hash] != msg.sender) {
            // only the author can unregister
            revert NotAuthorized();
        }
        docHashes[hash] = address(0); //reset
        emit DocUnregistered(hash);
    }
}
