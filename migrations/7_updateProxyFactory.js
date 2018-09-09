var Erc20Main = artifacts.require('./ERC20Main.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
var ProxyFactory = artifacts.require('./ProxyFactory.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    // return
    try {
      const controllerPointer = await ControllerPointer.deployed()
      console.log(
        _ + 'ControllerPointer deployed at: ' + controllerPointer.address
      )
      await deployer.deploy(ProxyFactory, controllerPointer.address)
      const proxyFactory = await ProxyFactory.deployed()
      console.log(_ + 'ProxyFactory deployed at: ' + proxyFactory.address)
    } catch (error) {
      console.log(error)
    }
  })
}
