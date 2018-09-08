import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract ControllerPointer is Ownable {
    address controller;
    address ERC20Main;

    constructor(address _controller, address _ERC20Main) {
        owner = msg.sender;
        setController(_controller);
        ERC20Main = _ERC20Main;
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
}
