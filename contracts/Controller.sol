import "./ControllerI.sol";
import "./ERC20MainI.sol";
contract Controller is ControllerI {
    event Buy(address indexed memeMarket, address indexed to, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 totalCostEth);
    event Sell(address indexed memeMarket, address indexed from, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 returnedEth);

      function curveIntegral(uint8 exponent, uint32 slope, uint256 tokens) internal returns (uint256) {
        uint256 nexp = exponent + 1;
        return (tokens ** nexp).div(nexp).div(slope);
      }

      function priceToMint(
        uint8 exponent,
        uint32 slope,
        uint256 totalSupply,
        uint256 poolBalance,
        uint256 numTokens) public returns(uint256) {
        return curveIntegral(exponent, slope, totalSupply.add(numTokens)).sub(poolBalance);
      }

      function rewardForBurn(
        uint8 exponent,
        uint32 slope,
        uint256 totalSupply,
        uint256 poolBalance,
        uint256 numTokens) public returns(uint256) {
        return poolBalance.sub(curveIntegral(exponent, slope, totalSupply.sub(numTokens)));
      }


  /// @dev                Mint new tokens with ether
  /// @param memeMarket   the marketplace
  /// @param numTokens    The number of tokens you want to mint
  function buy(address memeMarket, uint256 numTokens) public payable {
    uint256 sentEther = msg.value;
    uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
    uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
    uint8 exponent = ERC20MainI(memeMarket).exponent();
    uint32 slope = ERC20MainI(memeMarket).slope();

    uint256 priceForTokens = priceToMint(exponent, slope, totalSupply, poolBalance, numTokens);
    require(msg.value >= priceForTokens);

    require(ERC20MainI(memeMarket).mint(msg.sender, numTokens));
    ERC20MainI(memeMarket).setPoolBalance(poolBalance.add(priceForTokens));

    if (sentEther > priceForTokens) {
      uint256 refundAmount = sentEther.sub(priceForTokens);
      msg.sender.transfer(refundAmount);
      sentEther = sentEther.sub(refundAmount);
    }
    memeMarket.transfer(sentEther);
    emit Buy(memeMarket, msg.sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).tokenSupply, numTokens, priceForTokens);
  }

  /// @dev                Burn tokens to receive ether
  /// @param numTokens    The number of tokens that you want to burn
  function sell(address memeMarket, uint256 numTokens) public {
    uint256 senderBalance = ERC20MainI(memeMarket).balanceOf(msg.sender);
    require(senderBalance >= numTokens);

    uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
    uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
    uint8 exponent = ERC20MainI(memeMarket).exponent();
    uint32 slope = ERC20MainI(memeMarket).slope();

    uint256 ethToReturn = rewardForBurn(exponent, slope, totalSupply, poolBalance, numTokens);

    require(ERC20MainI(memeMarket).burn(msg.sender, numTokens));
    ERC20MainI(memeMarket).setPoolBalance(poolBalance.sub(ethToReturn));
    require(ERC20MainI(memeMarket).sendEth(msg.sender, ethToReturn));

    emit Sell(memeMarket, msg.sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).tokenSupply, numTokens, ethToReturn);
  }
}
