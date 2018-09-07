import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract Erc20Main is StandardToken {
  string public name;
  string public symbol;
  uint8 public decimals;
  uint8 public exponent;
  uint32 public slope;
  uint256 public poolBalance;
  bool inited;
  bool finalized;
  string memehash;

  // struct Multihash {
  //   bytes32 hash;
  //   uint8 hash_function;
  //   uint8 size;
  // }

  event Mint(address indexed to, uint256 amount, uint256 totalCost);
  event Burn(address indexed burner, uint256 amount, uint256 reward);
  event Inited(string __memehash);

  using SafeMath for uint256;

  function initToken(
    string _name,
    string _symbol,
    string _memehash
  ) public {
    require(!inited);
    require(poolBalance == 0 && totalSupply_ == 0);
    name = _name;
    symbol = _symbol;
    decimals = 18;
    exponent = 1;
    memehash = _memehash;
    slope = 1;
    inited = true;
    Inited(memehash);
  }

  function curveIntegral(uint256 t) internal returns (uint256) {
      uint256 nexp = exponent + 1;
      return (t ** nexp).div(nexp).div(slope);
  }

  function priceToMint(uint256 numTokens) public returns(uint256) {
      return curveIntegral(totalSupply_.add(numTokens)).sub(poolBalance);
  }

  function rewardForBurn(uint256 numTokens) public returns(uint256) {
      return poolBalance.sub(curveIntegral(totalSupply_.sub(numTokens)));
  }

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