var utils = require('web3-utils')
var Erc20Main = artifacts.require('./Erc20Main.sol')

let gasPrice = 1000000000 // 1GWEI

let _ = '        '

contract('Erc20Main', async function(accounts) {
  let erc20Main;

  before(done => {
    ;(async () => {
      try {
        var totalGas = new web3.BigNumber(0)

        // Deploy Erc20Main.sol
        erc20Main = await Erc20Main.new()
        var tx = web3.eth.getTransactionReceipt(erc20Main.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy erc20Main')
        erc20Main = await Erc20Main.deployed()

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })

  describe('Sample.sol', function() {
    it('should pass', async function() {
      assert(
        true === true,
        'this is true'
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
