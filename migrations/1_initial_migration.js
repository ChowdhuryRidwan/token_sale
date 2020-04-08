// In web development migrations allow you to change the state of the database you are working on.
// We need it whenever we deploy smart contracts because in every transaction we are writing to the blockchain. Basically migrating
// the blockchain to not having to having the smart contract and actually running the contract constructor.
var Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
