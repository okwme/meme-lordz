var Erc20Main = artifacts.require('./ERC20Main.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {
  deployer.then(async () => {
    try {
      await deployer.deploy(Erc20Main)
      const erc20Main = await Erc20Main.deployed()
      console.log(_ + 'Erc20Main deployed at: ' + erc20Main.address)
    } catch (error) {
      console.log(error)
    }
  })
}
