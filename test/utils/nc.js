const assert = require('assert')
const BigNumber = require('bignumber.js')

const startingBalance = new BigNumber(100e18)
const sendAmount = new BigNumber(5e18)

const testTransfer = async (nc, sender, receiver) => {
  const preSenderBalance = await nc.balanceOf(sender)
  const preReceiverBalance = await nc.balanceOf(receiver)

  await nc.transfer(receiver, sendAmount, { from: sender })

  const postSenderBalance = await nc.balanceOf(sender)
  const postReceiverBalance = await nc.balanceOf(receiver)

  assert.equal(
    preSenderBalance.sub(postSenderBalance).toString(),
    sendAmount.toString(),
    'the sender balance should be decremented by sendAmount'
  )
  assert.equal(
    postReceiverBalance.sub(preReceiverBalance).toString(),
    sendAmount.toString(),
    'the receiver balance should be incremented by sendAmount'
  )
}

const testTransferIncrementTotalSupply = async (nc, sender, receiver) => {
  const preTotalSupply = await nc.totalSupply()

  await testTransfer(nc, sender, receiver)

  const postTotalSupply = await nc.totalSupply()

  assert.equal(
    postTotalSupply.sub(preTotalSupply).toString(),
    startingBalance.toString(),
    'totalSupply should be incremented by active account starting balance'
  )
}

const testApprove = async (nc, approver, spender) => {
  await nc.approve(spender, sendAmount, { from: approver })

  const allowance = await nc.allowance(approver, spender)

  assert.equal(
    allowance.toString(),
    sendAmount.toString(),
    'sender should have set an allowance of sendAmount for receiver'
  )
}

const testTransferFrom = async (nc, approver, spender) => {
  const preSenderBalance = await nc.balanceOf(approver)
  const preReceiverBalance = await nc.balanceOf(spender)

  await nc.transferFrom(approver, spender, sendAmount, { from: spender })

  const postSenderBalance = await nc.balanceOf(approver)
  const postReceiverBalance = await nc.balanceOf(spender)

  assert.equal(
    preSenderBalance.sub(postSenderBalance).toString(),
    sendAmount.toString(),
    'the approver balance should be decremented by sendAmount'
  )
  assert.equal(
    postReceiverBalance.sub(preReceiverBalance).toString(),
    sendAmount.toString(),
    'the spender balance should be incremented by sendAmount'
  )
}

const testTransferFromIncrementTotalSupply = async (nc, approver, spender) => {
  const preTotalSupply = await nc.totalSupply()

  await testTransferFrom(nc, approver, spender)

  const postTotalSupply = await nc.totalSupply()

  assert.equal(
    postTotalSupply.sub(preTotalSupply).toString(),
    startingBalance.toString(),
    'totalSupply should be incremented by active account starting balance'
  )
}

const testBurn = async (nc, burner, amount) => {
  const bigAmount = new BigNumber(amount)
  const preSpentBalance = await nc.spentBalances(burner)
  const preTotalSupply = await nc.totalSupply()
  const preBalance = await nc.balanceOf(burner)

  const tx = await nc.burn(amount, {
    from: burner
  })

  const postTotalSupply = await nc.totalSupply()
  const postBalance = await nc.balanceOf(burner)

  // check for burn from active account
  if (preSpentBalance.greaterThan(0)) {
    const log = tx.logs[0]
    assert(log.event, 'there should be an event')
    assert.equal(log.event, 'Burn', 'Burn event should have occured')
    assert(log.args.burner, 'there should be an indexed burner arg')
    assert.equal(
      log.args.burner,
      burner,
      'the log should contain burner address'
    )
    assert(log.args.value, 'there should be a value event arg')
    assert.equal(
      log.args.value.toString(),
      bigAmount.toString(),
      'Burn event value should match burnAmount'
    )
    assert.equal(
      preTotalSupply.sub(postTotalSupply).toString(),
      bigAmount.toString(),
      'totalSupply should be decremented by the burn amount'
    )
  }

  assert.equal(
    preBalance.sub(postBalance).toString(),
    bigAmount.toString(),
    'balanceOf burner should be decremented by burn amount'
  )
}

module.exports = {
  startingBalance,
  sendAmount,
  testTransfer,
  testTransferIncrementTotalSupply,
  testApprove,
  testTransferFrom,
  testTransferFromIncrementTotalSupply,
  testBurn
}
