# NoobCoin

## What is NoobCoin?

NoobCoin is an ERC20 standard token that everyone owns. It may be useful for, well, noobs to use in order to become comfortable with using ERC20 tokens. It is meant as something that someone can use to practice with before making any mistakes that could be quite costly when dealing with tokens that have real world value.

Every address gets a starting supply of 100 NoobCoin. NoobCoin is just like a standard burnable token. `transfer`s and `transferFrom`s are handled properly and change actual balances.

`burn`ing is also possible in case someone wants to just get rid of them... this is useful if the user is using something like Parity wallet and the NoobCoin has been registered on the Parity registry. `burn`ing properly requires adding the ABI to your wallet. If you don't want to do this simply send the tokens to `0x0000000000000000000000000000000000000000` ( address(0) ).

### Specifications

Property | Value
-- | --
Token Type | ERC20
TotalSupply | Starts at 0 increases with use
Decimals | 18
Name | NoobCoin
Symbol | NCN
Kovan Address | 0x4fcf6b547fa5fb39492ebd91ac4c88289c40716e
Rinkeby Address | 0xd682fedb50f8d895c940bcac39472b0fd10966ab
Ropsten Address | 0x2f643a2bbdecf3606e8d9d46a7385b7e63bb5eac
Kovan Ethercan Verified Contract | [0x4fcf6b547fa5fb39492ebd91ac4c88289c40716e](https://kovan.etherscan.io/address/0x4fcf6b547fa5fb39492ebd91ac4c88289c40716e#code)
Ropsten Etherscan Verified Contract | [0x2f643a2bbdecf3606e8d9d46a7385b7e63bb5eac](https://ropsten.etherscan.io/address/0x2f643a2bbdecf3606e8d9d46a7385b7e63bb5eac#code)
Rinkeby Etherscan Verified Contract | [0xd682fedb50f8d895c940bcac39472b0fd10966ab](https://rinkeby.etherscan.io/address/0xd682fedb50f8d895c940bcac39472b0fd10966ab#code)

## Why NoobCoin?

The idea here is that if someone messes up... they can simply use a new address and have another 100 NoobCoin. This is also a nice way to get started since the user does not need to go to a faucet. They just need to watch the token in their wallet of choice.

## How to Use?

The easiest example is to simply add to your MetaMask wallet. Follow these instructions:

1. install MetaMask if you don't have: [download here](https://metamask.io/)
1. click orange fox icon on top right
1. Go through wallet setup if you haven't done
1. unlock account
1. click top left (probably green and says "Main Network")
1. choose test network (any bu main will do, if you don't know see "Which Network")
1. click tokens tab midway down the box (next to sent)
1. click add tokens
1. enter in address for proper network (see below)
1. click add
1. you should immediately see 100 NCN in your account.
1. ??? profit?

### Network Addresses

**Network Addresses**

*Choose one of these to see tokens*

Network | Address
-- | --
Main | N/A
Kovan | 0x4fcf6b547fa5fb39492ebd91ac4c88289c40716e
Rinkeby | 0xd682fedb50f8d895c940bcac39472b0fd10966ab
Ropsten | 0x2f643a2bbdecf3606e8d9d46a7385b7e63bb5eac

### Which Network ?

Any will work that are listed in the table above, but ropsten is probably the easiest if you do not know what you are doing. This is because you can very easily get ropsten ether which you will need in order to make any transactions on the network (remember transactions cost gas!).

In order to get ropsten ether follow these instructions:
*these directions assume you have followed directions above up until choose test network*

1. open MetaMask
1. click top left and choose ropsten
1. click buy (don't worry you wont spend any real money here... its free)
1. click ropsten test faucet
1. click request 1 ether from faucet
1. wait a few minutes
1. you should now see some ether in your account in the top left area of your MetMask plugin

## How to get Rid of Them?

Simply `transfer` them to `0x0000000000000000000000000000000000000000`

## How Does it Work?

NoobCoin works by manually returning an initial balance of 100e18 through the `initialBalance` method. Any further transactions in `transfer` or `transferFrom` are deducted or added using the `spentBalances` and `receivedBalances` mappings. `burn`t balances are saved through `burntBalances`. This can be seen here:

```
function balanceOf(address _owner)
  public
  view
  returns (uint256)
{
  return uint256(100e18)
    .add(receivedBalances[_owner])
    .sub(spentBalances[_owner])
    .sub(burntBalances[_owner]);
}
```

`burn`ing is done by simply incrementing the `burntBalances` by the `burn` `value`:

```
// will quietly burn if the burner never sent or received anything
function burn(uint256 _value)
  public
  returns (bool)
{
  require(_value <= balanceOf(msg.sender));
  burntBalances[msg.sender] = burntBalances[msg.sender].add(_value);
  if (
    spentBalances[msg.sender] > 0
    || receivedBalances[msg.sender] > 0
  ) {
    totalSupply = totalSupply.sub(_value);
    Burn(msg.sender, _value);
  }
  return true;
}
```

`totalSupply` is updated by the 100 token starting amount whenever someone transfers or receives tokens for the first time. This is tracked by checking the spender's `spentBalances` and `receivedBalances`. This is run every time a `transfer` or `transferFrom` occurs:

```
function incrementTotalSupply(
  address _sender,
  address _receiver
)
  private
  returns (uint256)
{
  if (
    spentBalances[_sender] == 0
    && receivedBalances[_sender] == 0
  ) {
    totalSupply = totalSupply.add(balanceOf(_sender));
  }

  if (
    spentBalances[_receiver] == 0
    && receivedBalances[_receiver] == 0) {
    totalSupply = totalSupply.add(balanceOf(_receiver));
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
  incrementTotalSupply(msg.sender, _to);
  spentBalances[msg.sender] = spentBalances[msg.sender].add(_value);
  receivedBalances[_to] = receivedBalances[_to].add(_value);
  Transfer(msg.sender, _to, _value);
  return true;
}
```

As you can see instead of using the `balances` mapping, the updated `balanceOf` is used instead.

## Tests

Tests are written in both solidity and javascript. Tests were not written for any OpenZeppelin code of course :)

To run the tests run:

```
yarn test
```

## NoobCoin ABI

In order to properly `burn` tokens, you must add the ABI to whatever wallet you are using. This is meant for people who know what they are doing. If you want to `burn` (get rid of your tokens), you can always send to `0x0000000000000000000000000000000000000000` ( address(0) ) without adding the ABI.

Here is the ABI:

```js
[
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "receivedBalances",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseApproval",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "burntBalances",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "spentBalances",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseApproval",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "burner",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Burn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

## Donations

If for some wild reason you want to send me Ether (testnet or real), I won't say no :)

Feel free to send any ether on any network to this address:

```
0x3aC7c51D964b4afc2FbCeC3C3Ac1b731FB7ECed0
```
