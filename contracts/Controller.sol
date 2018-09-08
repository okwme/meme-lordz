import "./ControllerI.sol";
import "./ERC20MainI.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "bancor-contracts/solidity/contracts/converter/BancorFormula.sol";

contract Controller is ControllerI, BancorFormula {
    using SafeMath for uint256;

    /* uint256 public poolBalance; */
    uint256 public virtualSupply;
    uint256 public virtualBalance;
    uint32 public reserveRatio; // represented in ppm, 1-1000000

    uint32 public exponent = 1;
    uint32 public slope = 1;


    event Buy(address indexed memeMarket, address indexed to, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 totalCostEth);
    event Sell(address indexed memeMarket, address indexed from, uint256 poolBalance, uint tokenSupply, uint256 amountTokens, uint256 returnedEth);

    function curveIntegral(uint256 tokens) internal returns (uint256) {
        uint32 nexp = exponent + 1;
        uint256 result;
        uint8 precision;
        (result, precision) = power(tokens, 1, nexp, 1);
        return result / slope;
        /* return (tokens ** nexp).div(nexp).div(slope); */ // TODO: confrim we're using bancor power() function
    }

    function priceToMint(
        uint256 totalSupply,
        uint256 poolBalance,
        uint256 numTokens) public returns(uint256) {
            return curveIntegral(totalSupply.add(numTokens)).sub(poolBalance);
        }

        function rewardForBurn(
            uint256 totalSupply,
            uint256 poolBalance,
            uint256 numTokens) public returns(uint256) {
                return poolBalance.sub(curveIntegral(totalSupply.sub(numTokens)));
            }


            /// @dev                Mint new tokens with ether
            /// @param memeMarket   the marketplace
            /// @param numTokens    The number of tokens you want to mint
            function buy(address memeMarket, address sender, uint256 numTokens) public payable returns (bool){
                uint256 sentEther = msg.value;
                uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
                uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();

                uint256 priceForTokens = priceToMint(totalSupply, poolBalance, numTokens);
                require(msg.value >= priceForTokens);

                require(ERC20MainI(memeMarket).mint(sender, numTokens));
                ERC20MainI(memeMarket).setPoolBalance(poolBalance.add(priceForTokens));

                if (sentEther > priceForTokens) {
                    uint256 refundAmount = sentEther.sub(priceForTokens);
                    sender.transfer(refundAmount);
                    sentEther = sentEther.sub(refundAmount);
                }
                memeMarket.transfer(sentEther);
                emit Buy(memeMarket, msg.sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).totalSupply(), numTokens, priceForTokens);
                return true;
            }

            /// @dev                Burn tokens to receive ether
            /// @param numTokens    The number of tokens that you want to burn
            function sell(address memeMarket, uint256 numTokens) public {
                uint256 senderBalance = ERC20MainI(memeMarket).balanceOf(msg.sender);
                require(senderBalance >= numTokens);

                uint256 totalSupply = ERC20MainI(memeMarket).totalSupply();
                uint256 poolBalance = ERC20MainI(memeMarket).poolBalance();

                uint256 ethToReturn = rewardForBurn(totalSupply, poolBalance, numTokens);

                require(ERC20MainI(memeMarket).burn(msg.sender, numTokens));
                ERC20MainI(memeMarket).setPoolBalance(poolBalance.sub(ethToReturn));
                require(ERC20MainI(memeMarket).sendEth(msg.sender, ethToReturn));

                emit Sell(memeMarket, msg.sender, ERC20MainI(memeMarket).poolBalance(), ERC20MainI(memeMarket).totalSupply(), numTokens, ethToReturn);
            }

            function initMeme(
                address sender,
                string _name,
                string _symbol,
                uint8 hash_function,
                uint8 size,
                bytes32 _memehash,
                uint256 _numTokens) public payable returns (bool) {
                    //require(buy(msg.sender, sender, _numTokens));
                    return true;
                }
            }
