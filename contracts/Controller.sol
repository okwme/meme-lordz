pragma solidity ^0.4.24;

import "./ControllerI.sol";
import "./ERC20MainI.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "bancor-contracts/solidity/contracts/converter/BancorFormula.sol";

contract Controller is ControllerI, BancorFormula {
    using SafeMath for uint256;
    uint256 public virtualBalance;
    uint256 public virtualSupply;
    uint32 public reserveRatio;  // represented in ppm, 1-1000000

    uint32 public exponent = 2;
    uint32 public slope = 1000;
    event logUint256(uint256 number);
    event logUint8(uint8 number);

    event Buy(address indexed memeMarket, address indexed to, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 totalCostEth);
    event Sell(address indexed memeMarket, address indexed from, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 returnedEth);

    constructor (uint32 _reserveRatio, uint256 _virtualSupply, uint256 _virtualBalance) public {
        reserveRatio = _reserveRatio;
        virtualSupply = _virtualSupply;
        virtualBalance = _virtualBalance;
    }


    function getBuy(uint256 totalSupply, uint256 poolBalance, uint256 buyValue) public view returns(uint256) {
        return calculatePurchaseReturn(
            safeAdd(totalSupply, virtualSupply),
            safeAdd(poolBalance, virtualBalance),
            reserveRatio,
            buyValue);
    }


    function getSell(uint256 totalSupply, uint256 poolBalance, uint256 sellAmount) public view returns(uint256) {
        return calculateSaleReturn(
            safeAdd(totalSupply, virtualSupply),
            safeAdd(poolBalance, virtualBalance),
            reserveRatio,
            sellAmount);
    }

    function buy(address memeMarket, address sender) public payable returns(bool) {
        require(msg.value > 0);
        uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
        uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
        uint256 tokens = getBuy(totalSupply, poolBalance, msg.value);
        require(tokens > 0);
        require(ERC20MainI(memeMarket).mint(sender, tokens));

        ERC20MainI(memeMarket).setPoolBalance(poolBalance.add(msg.value));
        memeMarket.transfer(msg.value);
        emit Buy(memeMarket, sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).totalSupply(), tokens, msg.value);
        return true;
    }


    /**
    * @dev sell Sell ClubTokens for Eth
    * @param sellAmount The amount of tokens to sell
    */
    function sell(address memeMarket, uint256 sellAmount) public returns(bool) {
        require(sellAmount > 0);
        require(ERC20MainI(memeMarket).balanceOf(msg.sender) >= sellAmount);
        uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
        uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
        uint256 saleReturn = getSell(totalSupply, poolBalance, sellAmount);

        require(saleReturn > 0);
        require(saleReturn <= poolBalance);
        require(ERC20MainI(memeMarket).burn(msg.sender, sellAmount));
        ERC20MainI(memeMarket).setPoolBalance(poolBalance.sub(saleReturn));
        require(ERC20MainI(memeMarket).sendEth(msg.sender, saleReturn));

        emit Sell(memeMarket, msg.sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).totalSupply(), sellAmount, saleReturn);
        return true;
    }

    function initMeme(
        address sender,
        string _name,
        string _symbol,
        uint8 hash_function,
        uint8 size,
        bytes32 _memehash
    ) public payable returns (bool) {
        if (msg.value > 0) {
            require(buy(msg.sender, sender));
        }
        //@TODO if this is called with no numTokens and msg.value, the ether gets trapped in controller
        return true;
    }
}
