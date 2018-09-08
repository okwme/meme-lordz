import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "ControllerI.sol"
import "ControllerPointer.sol"
contract ERC0Main is StandardToken {

    bool inited;
    bool public finalized;

    uint8 public decimals;
    uint8 public exponent;
    uint32 public slope;
    uint256 public poolBalance;
    ControllerI public controller;
    ControllerPointer public controllerPointer;

    Multihash public memehash;

    string public name;
    string public symbol;

    struct Multihash {
        uint8 hashFunction;
        uint8 size;
        bytes32 memehash;
    }

    modifier onlyController() {
        require(msg.sender == ControllerPointer.getController());
        _;
    }

    event Mint(address indexed to, uint256 amount, uint256 totalCost);
    event Burn(address indexed burner, uint256 amount, uint256 reward);
    event Inited(bytes32 memehash);
    event Finalized();

  using SafeMath for uint256;

  function initMeme(
    string _name,
    string _symbol,

    uint8 _hashFunction,
    uint8 _size,
    bytes32 _memehash,

    address _controllerPointer
  ) public
    payable {

    require(!inited);
    require(poolBalance == 0 && totalSupply_ == 0);

    decimals = 18;
    exponent = 1;
    slope = 1;
    inited = true;

    name = _name;
    symbol = _symbol;

    memehash.hashFunction = _hashFunction;
    memehash.size = _size;
    memehash.memehash = _memehash;

    controllerPointer = ControllerPointer(_controllerPointer);

    require(
        ControllerI(controllerPointer.getController()).initMeme.value(msg.value)(
            /* address(this), */
            msg.sender,
            /* string _name, */
            /* string _symbol, */
            /* uint8 hash_function, */
            uint8 size,
            bytes32 _memehash
        )
    );
    Inited(memehash);
  }

  function setSlope(uint32 _slope) public returns (bool) {
    require(!finalized);
    slope = _slope;
    return true;
  }

  function setExponent(uint8 _exponent) public returns (bool) {
    require(!finalized);
    exponent = _exponent;
    return true;
  }

  function finalize() public returns (bool) {
    require(!finalized);
    finalized = true;
    Finalized();
    return true;
  }


  /// @dev                Mint new tokens with ether
  /// @param numTokens    The number of tokens you want to mint
  function mint(address minter, uint256 numTokens) public onlyController returns(bool){
    totalSupply_ = totalSupply_.add(numTokens);
    balances[minter] = balances[minter].add(numTokens);
    emit Mint(minter, numTokens);
    return true;
  }

  /// @dev                Burn tokens to receive ether
  /// @param burner         The number of tokens that you want to burn
  /// @param numTokens    The number of tokens that you want to burn
  function burn(address burner, uint256 numTokens) public onlyController returns(bool) {
    totalSupply_ = totalSupply_.sub(numTokens);
    balances[burner] = balances[burner].sub(numTokens);
    emit Burn(burner, numTokens);
    return true;
  }

  function setPoolBalance(uint256 _poolBalance) public onlyController {
      poolBalance = _poolBalance;
  }
  /* function getPoolBalance() TODO: if needed  */

  function sendEth(address recipient, uint256 amountToSend) public onlyController returns(bool) {
    recipient.transfer(amountToSend);
    return true;
  }

}
