// const assert = require('assert')
// const contracts = require('../index.js')
// const Web3 = require('web3')

// global.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))

// describe('Controller.sol', function() {
//   before(async () => {
//     const accounts = await global.web3.eth.getAccounts()
//     const address = await deploy(contracts.Controller, accounts[0], [])
//     contracts.Controller.instance = new global.web3.eth.Contract(
//       contracts.Controller.abi,
//       address
//     )
//   })
//   describe('constructor()', function() {
//     it('should foobar', function() {
//       assert.equal(true, true)
//     })
//   })
// })

// function deploy(artifact, account, params) {
//   return new Promise((resolve, reject) => {
//     var contract = new global.web3.eth.Contract(artifact.abi)
//     contract
//       .deploy({
//         data: artifact.bytecode,
//         arguments: params,
//         from: account
//       })
//       .send(
//         {
//           from: account
//           // gas: '4200000'
//           // gasPrice: '4000000000'
//         },
//         (e, transactionHash) => {
//           console.log('tx', transactionHash)
//         }
//       )
//       .on('error', error => {
//         reject(error)
//       })
//       .then(instance => {
//         resolve(instance.options.address)
//       })
//   })
// }
