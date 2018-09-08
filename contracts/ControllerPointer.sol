import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract ControllerPointer is Ownable {
    address controller;
    address ERC20Main;
    bool public erc20Set;

    constructor(address _controller) {
        owner = msg.sender;
        setController(_controller);
    }
    function getController() public constant returns(address) {
        return controller;
    }
    function setController(address _controller) public onlyOwner {
        controller = _controller;
    }
    function getERC20Main() public constant returns(address) {
        return ERC20Main;
    }
    function setERC20Main(address _erc20Main) public onlyOwner {
        // @TODO put this back in
        /* require(!erc20Set); */
        ERC20Main = _erc20Main;
        /* erc20Set = true; */
    }
}
