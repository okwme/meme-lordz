import "./ControllerI.sol";
import "./ERC20MainI.sol";
contract Controller is ControllerI {
    event Buy(address indexed memeMarket, address indexed to, uint256 amount, uint256 totalCost);


      function curveIntegral(uint256 exponent, uint256 slope, uint256 tokens) internal returns (uint256) {
        uint256 nexp = exponent + 1;
        return (tokens ** nexp).div(nexp).div(slope);
      }

      function priceToMint(uint256 exponent, uint256 slope, uint256 totalSupply, uint256 poolBalance, uint256 numTokens) public returns(uint256) {
        return curveIntegral(exponent, slope, totalSupply.add(numTokens)).sub(poolBalance);
      }

      function rewardForBurn(uint256 numTokens) public returns(uint256) {
        return poolBalance.sub(curveIntegral(totalSupply_.sub(numTokens)));
      }


  /// @dev                Mint new tokens with ether
  /// @param memeMarket   the marketplace
  /// @param numTokens    The number of tokens you want to mint
  function buy(address memeMarket, uint256 numTokens) public payable {
    uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
    uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
    uint256 exponent = ERC20MainI(memeMarket).exponent();
    uint256 slope = ERC20MainI(memeMarket).slope();

    uint256 priceForTokens = priceToMint(exponent, slope, totalSupply, poolBalance, numTokens);
    require(msg.value >= priceForTokens);

    require(ERC20MainI(memeMarket).mint(msg.sender, numTokens));
    ERC20MainI(memeMarket).setPoolBalance(poolBalance.add(priceForTokens));

    /* if (msg.value > priceForTokens) {
        msg.sender.transfer(msg.value.sub(priceForTokens));
    } */
    emit Buy(memeMarket, msg.sender, numTokens, priceForTokens);
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
