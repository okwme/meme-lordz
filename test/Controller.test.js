var utils = require('web3-utils')
var Controller = artifacts.require('./Controller.sol')
var ERC20Main = artifacts.require('./ERC20Main.sol')

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
        tx = web3.eth.getTransactionReceipt(controller.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controller')

        try {
          // this is a wasted TX just to increase the nonce
          tx = await controller.initMeme(
            accounts[0], // supposed to be ERC address
            memeName,
            memeSym,
            hashFunction,
            hashSize,
            memeHash,
            numberOfTokens,
            { value }
          )
        } catch (error) {
          console.log(error)
          console.log(tx)
          return
        }

        //IMPORTANT: This needs to be the third nonce of a fresh account using our seed
        // Deploy ControllerPointer.sol
        controllerPointer = await ControllerPointer.new(controller.address)
        var tx = web3.eth.getTransactionReceipt(
          controllerPointer.transactionHash
        )
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy controllerPointer')
        console.log(_ + controllerPointer.address)

        // Deploy ERC20Main.sol
        eRC20Main = await ERC20Main.new()
        var tx = web3.eth.getTransactionReceipt(ERC20Main.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy ERC20Main')

        try {
          // this is a wasted TX just to increase the nonce
          tx = await eRC20Main.initMeme(
            memeName,
            memeSym,
            hashFunction,
            hashSize,
            memeHash,
            numberOfTokens,
            { value }
          )
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
        console.log(tx)
        console.log(error)
        assert(false, 'should not have failed')
      }
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
