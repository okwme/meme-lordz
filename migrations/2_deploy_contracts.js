var Erc20Main = artifacts.require('./ERC20Main.sol')
var ProxyFactory = artifacts.require('./ProxyFactory.sol')
var Controller = artifacts.require('./Controller.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {

      await deployer.deploy(Erc20Main)
      const erc20Main = await Erc20Main.deployed()
      console.log(_ + 'Erc20Main deployed at: ' + erc20Main.address)

      await deployer.deploy(Controller)
      const controller = await Controller.deployed()
      console.log(_ + 'Controller deployed at: ' + controller.address)

      await deployer.deploy(ControllerPointer, controller.address, erc20Main.address)
      const controllerPointer = await ControllerPointer.deployed()
      console.log(_ + 'ControllerPointer deployed at: ' + controllerPointer.address)

      await deployer.deploy(ProxyFactory, controllerPointer.address)
      const proxyFactory = await ProxyFactory.deployed()
      console.log(_ + 'ProxyFactory deployed at: ' + proxyFactory.address)
    } catch (error) {
      console.log(error)
    }
  })
}
