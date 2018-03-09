const NoobCoin = artifacts.require('../contracts/NoobCoin.sol')

module.exports = deployer => {
  deployer.deploy(NoobCoin)
}
