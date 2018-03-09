# NoobCoin

## What is NoobCoin?

NoobCoin is an ERC20 standard token that everyone owns. It may be useful for, well, noobs to use in order to become comfortable with using ERC20 tokens. It is meant as something that someone can use to practice with before making any mistakes that could be quiet costly when dealing with toekens that have real world value.

Every address gets a starting supply of 100 NoobCoin. NoobCoin is just like a standard burnable token. `transfer`s and `transferFrom`s are handled properly and change actual balances.

`burn`ing is also possible in case someone wants to just get rid of them... this is useful if the user is using something like Parity wallet and the NoobCoin has been registered on the Parity registry.

## Why NoobCoin?

The idea here is that if someone messes up... they can simply use a new address and have another 100 NoobCoin. This is also a nice way to get started since the user does not need to go to a faucet. They just need to watch the token in their wallet of choice.

## How Does it Work?

NoobCoin works by manually returning an initial balance of 100e18 through the `initialBalance` method. Any further transactions in `transfer` or `transferFrom` are deducted or added using the `spentBalances` and `receivedBalances` mappings. This can be seen here:

```
function balanceOf(address _owner)
  public
  view
  returns (uint256)
{
  return uint256(100e18)
    .add(receivedBalances[_owner])
    .sub(spentBalances[_owner]);
}
```

`burn`ing is done by simply incrementing the `spentBalances` by the `burn` `value`:

```
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
```

`totalSupply` is updated by the 100 token starting amount whenever someone transfers tokens for the first time. This is tracked by checking the spender's `spentBalances`. This is run every time a `transfer` or `transferFrom` occurs:

```
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
```

`transfer` and `transferFrom` are VERY similar to the standard OpenZeppelin methods:

```
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
```

As you can see instead of using the `balances` mapping, the updated `balanceOf` is used instead.
