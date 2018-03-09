const Migrations = artifacts.require('../contracts/Migrations.sol')

module.exports = deployer => {
  deployer.deploy(Migrations)
}
