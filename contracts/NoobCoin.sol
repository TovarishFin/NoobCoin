pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract NoobCoin is StandardToken {
  uint256 public totalSupply = 0;
  uint256 public decimals = 18;
  string public name = "NoobCoin";
  string public symbol = "NCN";
  mapping(address => uint256) private balances;
  mapping(address => uint256) public spentBalances;
  mapping(address => uint256) public receivedBalances;

  event Burn(address indexed burner, uint256 value);

  function balanceOf(address _owner)
    public
    view
    returns (uint256)
  {
    return uint256(100e18)
      .add(receivedBalances[_owner])
      .sub(spentBalances[_owner]);
  }

  function incrementTotalSupply(
    address _spender
  )
    private
    returns (uint256)
  {
    if (spentBalances[_spender] == 0) {
      totalSupply = totalSupply.add(100e18);
    }
    return totalSupply;
  }

  // same as standard function but uses balanceOf instead
  // also increments totalSupply by senders original balance
  function transfer(
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_to != address(0));
    require(_value <= balanceOf(msg.sender));
    incrementTotalSupply(msg.sender);
    spentBalances[msg.sender] = spentBalances[msg.sender].add(_value);
    receivedBalances[_to] = receivedBalances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  // same as standard function but uses balanceOf instead
  // also increments totalSupply by senders original balance
  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_to != address(0));
    require(_value <= balanceOf(_from));
    require(_value <= allowed[_from][msg.sender]);
    incrementTotalSupply(_from);
    spentBalances[_from] = spentBalances[_from].add(_value);
    receivedBalances[_to] = receivedBalances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  // will quietly burn if the burner never sent anything
  function burn(uint256 _value)
    public
    returns (bool)
  {
    require(_value <= balanceOf(msg.sender));
    address _burner = msg.sender;
    uint256 _preSpentBalance = spentBalances[_burner];
    spentBalances[_burner] = spentBalances[_burner].add(_value);
    if (_preSpentBalance > 0) {
      totalSupply = totalSupply.sub(_value);
      Burn(_burner, _value);
    }
    return true;
  }
}
