const utils = require('web3-utils')

var vals = (module.exports = {
  reserveRatio: '333333', // parts per million 500000 / 1000000 = 1/2
  virtualBalance: utils.toWei('33'),
  virtualSupply: utils.toWei('100000')
})
