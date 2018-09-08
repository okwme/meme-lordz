var ERC20Main = artifacts.require('./ERC20Main.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      const erc20Main = await ERC20Main.deployed()
      const controllerPointer = await ControllerPointer.deployed()
      await controllerPointer.setERC20Main(erc20Main.address)
      console.log(
        _ + 'Set ControllerPointer to have ERC20Main: ' + erc20Main.address
      )
    } catch (error) {
      console.log(error)
    }
  })
}
