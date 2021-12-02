pragma solidity ^0.4.24;

contract ControllerI {
    function initMeme(
        address sender,
        string _name,
        string _symbol,
        uint8 hash_function,
        uint8 size,
        bytes32 _memehash
    ) public payable returns (bool);
}
