pragma solidity 0.4.19;

import "truffle/Assert.sol";
import "../../contracts/NoobCoin.sol";

contract TestNoobCoin {

  NoobCoin private nc = new NoobCoin();

  function testBalanceOf() {
    uint256 _expectedBalance = 100e18;

    uint256 _actualBalance = nc.balanceOf(msg.sender);

    Assert.equal(
      _expectedBalance,
      _actualBalance,
      "balanceOf should return a starting balance of 100e18"
    );
  }
}
