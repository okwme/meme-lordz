var utils = require('web3-utils')
var Controller = artifacts.require('./Controller.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
var ERC20Main = artifacts.require('./ERC20Main.sol')
const {
  getReceipt,
  sendTransaction
} = require('./helpers/main.js')

let ONEGWEI = 1000000000 // 1GWEI

let _ = '        '

contract('Controller', async function(accounts) {
  let controller, eRC20Main
  var memeName = 'MEME NAME'
  var memeSym = 'MEME'
  var hashFunction = '12'
  var hashSize = '20'
  var memeHash = accounts[1]
  var numberOfTokens = '0'
  var value = '0'
  before(done => {
    ;(async () => {
      try {
        var totalGas = new web3.BigNumber(0)

        var tx

        // Deploy Controller.sol
        controller = await Controller.new()
        tx = await getReceipt(controller.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controller')

        try {
          // this is a wasted TX just to increase the nonce
          tx = await sendTransaction(web3, { value, from: accounts[0], to: accounts[1] })
        } catch (error) {
          console.log(error)
          console.log(tx)
          return
        }

        //IMPORTANT: This needs to be the third nonce of a fresh account using our seed
        // Deploy ControllerPointer.sol
        controllerPointer = await ControllerPointer.new(controller.address)
        console.log(_ + controllerPointer.address)

        // Deploy ERC20Main.sol
        eRC20Main = await ERC20Main.new()
        var tx = await getReceipt(ERC20Main.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy ERC20Main')

        try {
          // this is a wasted TX just to increase the nonce
          tx = await sendTransaction(web3, { value, from: accounts[0], to: accounts[1] })
        } catch (error) {
          console.log(error)
          console.log(tx)
          return
        }

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })
  describe('Controller.sol', function() {
    it('should buy 10 tokens successfully', async function() {
      const self = accounts[0]
      const buyAmount = '10'
      const totalSupply = await eRC20Main.totalSupply()
      const poolBalance = await eRC20Main.poolBalance()
      const mintingPrice = await controller.priceToMint(
        totalSupply,
        poolBalance,
        buyAmount
      )
      var tx
      try {
        tx = await controller.buy(eRC20Main.address, self, buyAmount)
      } catch (error) {
        console.log('fail in buy')
        console.log(tx)
        console.log(error)
        assert(false, 'should not have failed')
      }
    })
  })
})
