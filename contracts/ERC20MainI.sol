contract ERC20MainI {
    function poolBalance() public view returns (uint256);
    function totalSupply() public view returns (uint256);
    function exponent() public view returns (uint8);
    function slope() public view returns (uint32);
    function setPoolBalance(uint256 _poolBalance) public;
    function mint(address minter, uint256 numTokens) public returns (bool);
    function burn(address burner, uint256 numTokens) public returns (bool);
    function balanceOf(address owner) public view returns (uint256);
    function sendEth(address recipient, uint256 amountToSend) public returns(bool);
}
