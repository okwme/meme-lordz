var Erc20Main = artifacts.require('./Erc20Main.sol')
var ProxyFactory = artifacts.require('./ProxyFactory.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
      // Deploy Erc20Main.sol
      await deployer.deploy(Erc20Main)
      const erc20Main = await Erc20Main.deployed()
      console.log(_ + 'Erc20Main deployed at: ' + erc20Main.address)
      await deployer.deploy(ProxyFactory)
      const proxyFactory = await ProxyFactory.deployed()
      console.log(_ + 'ProxyFactory deployed at: ' + proxyFactory.address)
    } catch (error) {
      console.log(error)
    }
  })
}
