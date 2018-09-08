var Erc20Main = artifacts.require('./ERC20Main.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    return;
    try {
      await deployer.deploy(Erc20Main, { overwrite: true })
      const erc20Main = await Erc20Main.deployed()
      console.log(_ + 'Erc20Main re-deployed at: ' + erc20Main.address)

      const controllerPointer = await ControllerPointer.deployed()
      console.log(
        _ + 'ControllerPointer deployed at: ' + controllerPointer.address
      )
      var tx = await controllerPointer.setERC20Main(erc20Main.address)
    } catch (error) {
      console.log(error)
    }
  })
}
