const sendTransaction = (web3, args) => {
  return new Promise(function(resolve, reject) {
    web3.eth.sendTransaction(args, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

const testWillThrow = async (fn, args) => {
  try {
    const txHash = await fn.apply(null, args)
    if (web3.version.network === 4448) {
      // if network is devGeth
      await waitForReceiptStatusSuccessOrThrow(txHash)
    }
    assert(false, 'the contract should throw here')
  } catch (error) {
    assert(
      /invalid opcode/.test(error.message || error) ||
      /invalid argument/.test(error.message || error) || // needed for geth compatibility
        /revert/.test(error.message || error),
      `the error message should be "invalid opcode", "invalid argument" or "revert", the error was ${error}`
    )
  }
}

const getReceipt = txHash => {
  if (typeof txHash === 'object' && txHash.receipt) {
    return txHash.receipt
  }
  return new Promise(function(resolve, reject) {
    web3.eth.getTransactionReceipt(txHash, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })
}

const getGasUsed = async txHash => {
  const receipt = await getReceipt(txHash)
  return receipt.gasUsed
}

const waitForReceiptStatusSuccessOrThrow = async txHash => {
  const receipt = await getReceipt(txHash)
  if (receipt.status === '0x0') {
    throw new Error('revert')
  }
  return receipt
}

function getBalanceAsync(address) {
  return new Promise((res, rej) => {
    web3.eth.getBalance(address, (err, result) => {
      if (err) rej(err);
      res(result)
    })
  })
}

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

module.exports = {
  sendTransaction,
  getReceipt,
  testWillThrow,
  waitForReceiptStatusSuccessOrThrow,
  getBalanceAsync,
  getBlockNumber,
  increaseBlocks,
  decodeEventString
}
