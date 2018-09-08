var utils = require('web3-utils')
var Controller = artifacts.require('./Controller.sol')
var ControllerPointer = artifacts.require('./ControllerPointer.sol')
var ERC20Main = artifacts.require('./ERC20Main.sol')

const { getReceipt, sendTransaction } = require('../helpers/main.js')

var {
  reserveRatio,
  virtualSupply,
  virtualBalance
} = require('../helpers/utils')

let ONEGWEI = 1000000000 // 1GWEI

let _ = '        '

contract('Controller.sol', async function(accounts) {
  let controller, eRC20Main, controllerPointer
  var memeName = 'MEME NAME'
  var memeSym = 'MEME'
  var hashFunction = '12'
  var hashSize = '20'
  var memeHash = accounts[1]
  var value = '0'
  var totalGas
  before(done => {
    ;(async () => {
      totalGas = new web3.BigNumber(0)
      console.log('nonce', web3.eth.getTransactionCount(accounts[0]))
      var tx
      try {
        // Deploy Controller.sol
        controller = await Controller.new(
          reserveRatio,
          virtualSupply,
          virtualBalance
        )
        tx = web3.eth.getTransactionReceipt(controller.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controller')

        // Get ControllerPointer.sol
        controllerPointer = await ControllerPointer.deployed()
        await controllerPointer.setController(controller.address)

        console.log(_ + ' - Get Deployed controllerPointer')
        console.log(_ + controllerPointer.address)
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })
  describe('ERC w/ No Initial Value', function() {
    it('should init with no initial value', async function() {
      // Deploy ERC20Main.sol
      eRC20Main = await ERC20Main.new()
      var tx = web3.eth.getTransactionReceipt(ERC20Main.transactionHash)
      totalGas = totalGas.plus(tx.gasUsed)
      console.log(_ + tx.gasUsed + ' - Deploy ERC20Main')

      try {
        tx = await eRC20Main.initMeme(
          memeName,
          memeSym,
          hashFunction,
          hashSize,
          memeHash,
          { value }
        )
        console.log(_ + 'eRC20Main.initMeme? ' + tx.receipt.status)
      } catch (error) {
        console.log('error', error)
        console.log('tx', tx)
        assert(false, 'initMeme should not have failed')
      }

      console.log(_ + '-----------------------')
      console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
    })

    it('should spend 1 ETH successfully', async function() {
      var tx
      let buyResult
      const self = accounts[0]
      const spend = '1'
      const spendAmount = utils.toWei(spend)
      const totalSupply = await eRC20Main.totalSupply()
      const poolBalance = await eRC20Main.poolBalance()
      try {
        buyResult = await controller.getBuy(
          totalSupply,
          poolBalance,
          spendAmount
        )
        console.log(
          _ + 'Spend ' + spend + 'ETH and receive ',
          utils.fromWei(buyResult.toString(10)) + ' Tokens'
        )
        try {
          tx = await controller.buy(eRC20Main.address, self, {
            value: spendAmount.toString(10)
          })
          console.log(_ + 'controller.buy? ' + tx.receipt.status)

          const newBalance = await eRC20Main.balanceOf(accounts[0])
          assert(
            newBalance.toString(10) === buyResult.toString(10),
            'newBalance (' +
              utils.fromWei(newBalance.toString(10)) +
              ') does not equal buyResult (' +
              utils.fromWei(buyResult.toString(10)) +
              ')'
          )
        } catch (error) {
          console.log('error', error)
          assert(false, 'buy should not have failed')
        }
      } catch (error) {
        console.log('error', error)
        assert(false, 'priceToMint should not have failed')
      }
    })
  })
  describe('ERC w Initial Value', function() {
    it('should init with initial value of 10', async function() {
      // Deploy ERC20Main.sol
      const spend = '1'

      eRC20Main = await ERC20Main.new()
      var tx = web3.eth.getTransactionReceipt(ERC20Main.transactionHash)
      totalGas = totalGas.plus(tx.gasUsed)
      console.log(_ + tx.gasUsed + ' - Deploy ERC20Main')

      try {
        tx = await eRC20Main.initMeme(
          memeName,
          memeSym,
          hashFunction,
          hashSize,
          memeHash,
          { value: utils.toWei(spend) }
        )
        console.log(_ + 'eRC20Main.initMeme? ' + tx.receipt.status)
      } catch (error) {
        console.log('error', error)
        console.log('tx', tx)
        assert(false, 'initMeme should not have failed')
      }

      console.log(_ + '-----------------------')
      console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
    })

    it('should spend 1 more ETH successfully', async function() {
      var tx
      let buyResult
      const self = accounts[0]
      const spend = '1'
      const originalBalance = await eRC20Main.balanceOf(self)
      const spendAmount = utils.toWei(spend)
      const totalSupply = await eRC20Main.totalSupply()
      const poolBalance = await eRC20Main.poolBalance()
      try {
        buyResult = await controller.getBuy(
          totalSupply,
          poolBalance,
          spendAmount
        )
        console.log(
          _ + 'Spend ' + spend + 'ETH and receive ',
          utils.fromWei(buyResult.toString(10)) + ' Tokens'
        )
        try {
          tx = await controller.buy(eRC20Main.address, self, {
            value: spendAmount.toString(10)
          })
          console.log(_ + 'controller.buy? ' + tx.receipt.status)

          const newBalance = await eRC20Main.balanceOf(accounts[0])
          assert(
            newBalance.toString(10) ===
              buyResult.add(originalBalance).toString(10),
            'newBalance (' +
              utils.fromWei(newBalance.toString(10)) +
              ') does not equal buyResult plus originalBalance (' +
              utils.fromWei(buyResult.add(originalBalance).toString(10)) +
              ')'
          )
        } catch (error) {
          console.log('error', error)
          assert(false, 'buy should not have failed')
        }
      } catch (error) {
        console.log('error', error)
        assert(false, 'priceToMint should not have failed')
      }
    })

    it('should sell some tokens for ETH', async function() {
      const self = accounts[0]
      let ethBalanceBefore = await web3.eth.getBalance(self)
      let tokensBefore = await eRC20Main.balanceOf(self)

      const totalSupply = await eRC20Main.totalSupply()
      const poolBalance = await eRC20Main.poolBalance()
      let sellResult = await controller.getSell(
        totalSupply,
        poolBalance,
        tokensBefore
      )

      try {
        var tx = await controller.sell(eRC20Main.address, tokensBefore)
        console.log(_ + 'controller.sell? ' + tx.receipt.status)
        let ethBalanceAfter = await web3.eth.getBalance(self)
        let tokensAfter = await eRC20Main.balanceOf(self)
        assert(
          tokensAfter.toString() === '0',
          'tokensAfter (' + utils.fromWei(tokensAfter.toString()) + ') not 0'
        )
        console.log(_ + 'before: ' + utils.fromWei(ethBalanceBefore.toString()))
        console.log(_ + 'after: ' + utils.fromWei(ethBalanceAfter.toString()))
        assert(
          parseFloat(utils.fromWei(ethBalanceAfter.toString())) >
            parseFloat(utils.fromWei(ethBalanceBefore.toString())),
          'ethBalanceAfter was not more than ethBalanceBefore'
        )
      } catch (error) {
        console.log('error', error)
      }
    })
  })
})
