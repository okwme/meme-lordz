contract ControllerPointer {
    address controllerAddress;
    address owner;
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    constructor(address _controllerAddress) {
        owner = msg.sender;
        setController(_controllerAddress);
    }
    function getController() public constant returns(address) {
        return controllerAddress;
    }
    function setController(address _controllerAddress) public onlyOwner {
        controllerAddress = _controllerAddress;
    }
}
