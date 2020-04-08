var RToken = artifacts.require("./RToken.sol"); // artifact allows us to create a contract abstraction that truffle can use
//to run in a javascript runtime environment. Allows us to interact with a smartcontract with clientside application.
var RTokenSale = artifacts.require("./RTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(RToken, 1000000).then(function(){
    //token price is 0.001 ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(RTokenSale, RToken.address, tokenPrice);
  }); //the 2nd arguement is connected to contructor function in RToken.sol.
  //deployer.deploy(RTokenSale);
};
