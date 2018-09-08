var utils = require('web3-utils')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
var Controller = artifacts.require('./Controller.sol')

let ONEGWEI = 1000000000 // 1GWEI

let _ = '        '

contract('ControllerPointer', async function(accounts) {
  let controllerPointer, controller
  before(done => {
    ;(async () => {
      try {
        var totalGas = new web3.BigNumber(0)

        // Deploy Controller.sol
        controller = await Controller.new()
        var tx = web3.eth.getTransactionReceipt(controller.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controller')

        // Deploy ControllerPointer.sol
        controllerPointer = await ControllerPointer.new(controller.address)
        var tx = web3.eth.getTransactionReceipt(
          controllerPointer.transactionHash
        )
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controllerPointer')

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
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

function getBlockNumber() {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) reject(error)
      resolve(result)
    })
  })
}

function increaseBlocks(blocks) {
  return new Promise((resolve, reject) => {
    increaseBlock().then(() => {
      blocks -= 1
      if (blocks == 0) {
        resolve()
      } else {
        increaseBlocks(blocks).then(resolve)
      }
    })
  })
}

function increaseBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: 12345
      },
      (err, result) => {
        if (err) reject(err)
        resolve(result)
      }
    )
  })
}

function decodeEventString(hexVal) {
  return hexVal
    .match(/.{1,2}/g)
    .map(a =>
      a
        .toLowerCase()
        .split('')
        .reduce(
          (result, ch) => result * 16 + '0123456789abcdefgh'.indexOf(ch),
          0
        )
    )
    .map(a => String.fromCharCode(a))
    .join('')
}
