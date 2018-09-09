import "./ControllerI.sol";
import "./ERC20MainI.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "bancor-contracts/solidity/contracts/converter/BancorFormula.sol";

contract Controller is ControllerI, BancorFormula {
    using SafeMath for uint256;
    uint256 public virtualBalance;
    uint256 public virtualSupply;
    uint32 public reserveRatio;  // represented in ppm, 1-1000000
    uint8 public decimals = 18;
    uint32 public exponent = 2;
    uint32 public slope = 1000;
    event logUint256(uint256 number);
    event logUint8(uint8 number);

    event Buy(address indexed memeMarket, address indexed to, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 totalCostEth);
    event Sell(address indexed memeMarket, address indexed from, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 returnedEth);

    event Minted(uint256 amount, uint256 totalCost);
    event Burned(uint256 amount, uint256 reward);
/*
    constructor (uint32 _reserveRatio, uint256 _virtualSupply, uint256 _virtualBalance) public {
        reserveRatio = _reserveRatio;
        virtualSupply = _virtualSupply;
        virtualBalance = _virtualBalance;
    }


    function getBuy(uint256 totalSupply, uint256 poolBalance, uint256 buyValue) public constant returns(uint256) {
        return calculatePurchaseReturn(
            safeAdd(totalSupply, virtualSupply),
            safeAdd(poolBalance, virtualBalance),
            reserveRatio,
            buyValue);
    }


    function getSell(uint256 totalSupply, uint256 poolBalance, uint256 sellAmount) public constant returns(uint256) {
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
    } */

    /// @dev        Calculate the integral from 0 to t
    /// @param t    The number to integrate to
    function curveIntegral(uint256 t) internal returns (uint256) {
        uint256 nexp = exponent + 1;
        return (t ** nexp).div(nexp).div(slope).div((10 ** (uint256(decimals) * uint256(exponent))));
    }

    function priceToMint(uint256 totalSupply, uint256 poolBalance, uint256 numTokens) public returns(uint256) {
        return curveIntegral(totalSupply.add(numTokens)).sub(poolBalance);
    }

    function rewardForBurn(uint256 totalSupply, uint256 poolBalance, uint256 numTokens) public returns(uint256) {
        return poolBalance.sub(curveIntegral(totalSupply.sub(numTokens)));
    }


    function mint(address memeMarket, uint256 numTokens) public payable {
        uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
        uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();
        uint256 sentEther = msg.value;

        uint256 priceForTokens = priceToMint(totalSupply, poolBalance, numTokens);
        require(msg.value >= priceForTokens);
        require(ERC20MainI(memeMarket).mint(msg.sender, numTokens));
        /* totalSupply_ = totalSupply_.add(numTokens);
        balances[msg.sender] = balances[msg.sender].add(numTokens); */
        poolBalance = poolBalance.add(priceForTokens);
        ERC20MainI(memeMarket).setPoolBalance(poolBalance);

        if (sentEther > priceForTokens) {
          uint256 refundAmount = sentEther.sub(priceForTokens);
          msg.sender.transfer(refundAmount);
          sentEther = sentEther.sub(refundAmount);
        }
        memeMarket.transfer(sentEther);

        /* emit Minted(numTokens, priceForTokens); */
    }

    /// @dev                Burn tokens to receive ether
    /// @param numTokens    The number of tokens that you want to burn
    function burn(address memeMarket, uint256 numTokens) public {
        uint256 senderBalance = ERC20MainI(memeMarket).balanceOf(msg.sender);
        require(senderBalance >= numTokens);

        uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
        uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();

        uint256 ethToReturn = rewardForBurn(totalSupply, poolBalance, numTokens);

        require(ERC20MainI(memeMarket).burn(msg.sender, numTokens));
        ERC20MainI(memeMarket).setPoolBalance(poolBalance.sub(ethToReturn));
        require(ERC20MainI(memeMarket).sendEth(msg.sender, ethToReturn));

        /* emit Burned(numTokens, ethToReturn); */
    }

    function initMeme(
        address sender,
        string _name,
        string _symbol,
        uint8 hash_function,
        uint8 size,
        bytes32 _memehash
    ) public payable returns (bool) {
        /* if (msg.value > 0) {
            require(buy(msg.sender, sender));
        } */
        //@TODO if this is called with no numTokens and msg.value, the ether gets trapped in controller
        return true;
    }
}
