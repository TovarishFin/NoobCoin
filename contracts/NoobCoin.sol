pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";


contract NoobCoin is StandardToken {
  uint256 public decimals = 18;
  string public name = "NoobCoin";
  string public symbol = "NCN";
  mapping(address => uint256) private balances;
  mapping(address => uint256) public spentBalances;
  mapping(address => uint256) public receivedBalances;

  function balanceOf(address _owner)
    public
    view
    returns (uint256 balance)
  {
    return uint256(100e18)
      .add(spentBalances[_owner])
      .sub(spentBalances[_owner]);
  }

  function transfer(
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_to != address(0));
    require(_value <= balanceOf(msg.sender));
    spentBalances[msg.sender] = spentBalances[msg.sender].add(_value);
    receivedBalances[_to] = receivedBalances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  )
    public
    returns (bool)
  {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    spentBalances[_from] = spentBalances[_from].add(_value);
    receivedBalances[_to] = receivedBalances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }
}
