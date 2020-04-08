// Rtoken is the smart contract thats going to implement the ERC-20 standard. Govern behaviour of cryptocurrency itself.
// this contract is responsible to know where each token is
pragma solidity ^0.5.0;

contract RToken {
    //Name
    string public name = "RCoin";
    //Symbol
    string public symbol = "R";
    string public standard = "RCoin v1.0"; //only this is not part of ERC-20 standard
    //Have to setup some tests.
    // We need a constructor.
    // Set the  total number of tokens.
    // Read the total number of tokens.
    uint256 public totalSupply = 75000; //state variable that will write to blockchain whenever contract is migrated.
/* This was done when everything was working fine. function was changed to a constructor
    constructor () public { // visibility set to public since function has to run when smart contract is deployed
        totalSupply = 1000000; //total tokens.
    }
*/
//these events are going to get logged in transaction logs.
     event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

     //approve
     event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
     );
    //this structured mapping is called balanceOf and this structure is going to be called publicly. its going to give a reader function called balanceOf that takes in the address of the owner and returns account balance. This is supplied from RToken.js in test folder. 1000000 is set over there.
    // mapping has key, value pair
    mapping(address => uint256) public balanceOf;
    //allowance. state variable with public visibility. nested mapping. address is mine and i can transfer to account a,b,c,d,e.....The one before can only transfer to one account but nested one can transfer to multiple ones
    mapping(address => mapping(address => uint256)) public allowance;
    constructor (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply; //msg is a global variable. sender is the address that called the function. Our initial supply is going to be sent to this address. msg_sender is the account that aquired all the tokens initially.
        totalSupply = _initialSupply; // underscore convention is used in solidity to signify variables available only inside this function.
        //allocate the initial supply. Take the initial 1000000 tokens and put them somewhere
    }
    //Transfer function. To transfer tokens from one place to another. Below are the things that the transfer function should do:
    function transfer(address _to, uint256 _value) public returns (bool success) {
        //Trigger an exception if account doesnt have enough
        require(balanceOf[msg.sender] >= _value, "Insufficient sender balance"); //if this is true everything below it runs.
        //Transfer the balance
        balanceOf[msg.sender] -= _value; //deducting balance from one account
        balanceOf[_to] += _value;  // adding it to another account
        //trigger Transfer event
        emit Transfer(msg.sender, _to, _value);
        //Return a boolean
        return true;
    }

    //Delegated transfer. One function to approve a transfer and the other to seal a transfer from one account to another without the sender initiating the transfer.
    function approve(address _spender, uint256 _value) public returns (bool success) {
        //allowance
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

//allows  us to handle the delegated transfer.
   function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        //require _from has enough tokens
        require(_value <= balanceOf[_from], 'Amount should not exceed balance');
        require(_value <= allowance[_from][msg.sender], 'Amount should not exceed allowance'); //require allowance is big enough
        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //update the allowance
        allowance[_from][msg.sender] -= _value;
        //transfer event
        emit Transfer(_from, _to, _value);

        return true;
    }

}


