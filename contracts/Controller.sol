contract Controller {
  /// @dev                Mint new tokens with ether
  /// @param numTokens    The number of tokens you want to mint
  function mint(uint256 numTokens) public payable {
    uint256 priceForTokens = priceToMint(numTokens);
    require(msg.value >= priceForTokens);

    totalSupply_ = totalSupply_.add(numTokens);
    balances[msg.sender] = balances[msg.sender].add(numTokens);
    poolBalance = poolBalance.add(priceForTokens);
    if (msg.value > priceForTokens) {
        msg.sender.transfer(msg.value - priceForTokens);
    }

    emit Mint(msg.sender, numTokens, priceForTokens);
  }

  /// @dev                Burn tokens to receive ether
  /// @param numTokens    The number of tokens that you want to burn
  function burn(uint256 numTokens) public {
    require(balances[msg.sender] >= numTokens);

    uint256 ethToReturn = rewardForBurn(numTokens);
    totalSupply_ = totalSupply_.sub(numTokens);
    balances[msg.sender] = balances[msg.sender].sub(numTokens);
    poolBalance = poolBalance.sub(ethToReturn);
    msg.sender.transfer(ethToReturn);

    emit Burn(msg.sender, numTokens, ethToReturn);
  }
}
