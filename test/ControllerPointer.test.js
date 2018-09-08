var utils = require('web3-utils')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
var Controller = artifacts.require('./Controller.sol')
const {
  getReceipt
} = require('./helpers/main.js')

let ONEGWEI = 1000000000 // 1GWEI

let _ = '        '

contract('ControllerPointer', async function(accounts) {
  let controllerPointer, controller
  before(done => {
    ;(async () => {
      try {
        var totalGas = new web3.BigNumber(0)

        // Deploy Controller.sol
        controller = await Controller.deployed()

        // Deploy ControllerPointer.sol
        controllerPointer = await ControllerPointer.deployed()

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(error)
      }
    })()
  })
  describe('ControllerPointer.sol', function() {
    it('getController should return controller', async function() {
      let controllerAddress = await controllerPointer.getController()
      assert(
        controllerAddress === controller.address,
        'ControllerAddress (' +
          controllerAddress +
          ') did not equal controller.address (' +
          controller.address +
          ')'
      )
    })
    it('setController should set & return controller', async function() {
      let controllerAddress = accounts[1]
      await controllerPointer.setController(controllerAddress)
      const returnedControllerAddress = await controllerPointer.getController()
      assert(
        controllerAddress === returnedControllerAddress,
        'ControllerAddress (' +
          controllerAddress +
          ') did not equal returnedControllerAddress (' +
          returnedControllerAddress +
          ')'
      )
    })
    it('setERC20Main should set & return ERC20Main', async function() {
      let erc20Set = await controllerPointer.erc20Set()
      assert(!erc20Set, 'erc20Set should be false but it is ' + erc20Set)

      let ERC20Address = accounts[2]
      console.log(accounts[2])
      await controllerPointer.setERC20Main(ERC20Address)
      const returnedERC20Address = await controllerPointer.getERC20Main()
      assert(
        ERC20Address === returnedERC20Address,
        'ERC20Address (' +
          ERC20Address +
          ') did not equal returnedERC20Address (' +
          returnedERC20Address +
          ')'
      )
    })
    // this one is skipped until we turn this feature back on
    it.skip('setERC20Main should fail the second time', async function() {
      let ERC20Address = accounts[3]
      let tx
      try {
        tx = await controllerPointer.setERC20Main(ERC20Address)
      } catch (error) {
        assert(true)
        return
      }
      assert(
        tx.receipt.status === '0x00',
        'setERC20 a second time should have failed'
      )
    })
  })
})
