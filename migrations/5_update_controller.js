var Controller = artifacts.require('./Controller.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    return;
    try {
      await deployer.deploy(Controller, { overwrite: true })
      const controller = await Controller.deployed()
      console.log(_ + 'Controller deployed at: ' + controller.address)

      const controllerPointer = await ControllerPointer.deployed()
      console.log(
        _ + 'ControllerPointer deployed at: ' + controllerPointer.address
      )
      var tx = await controllerPointer.setController(controller.address)
    } catch (error) {
      console.log(error)
    }
  })
}
