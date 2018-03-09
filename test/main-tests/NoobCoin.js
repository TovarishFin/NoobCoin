const NoobCoin = artifacts.require('../../contracts/NoobCoin.sol')
const assert = require('assert')

const {
  startingBalance,
  sendAmount,
  testTransfer,
  testTransferIncrementTotalSupply,
  testApprove,
  testTransferFrom,
  testTransferFromIncrementTotalSupply,
  testBurn
} = require('../utils/nc')

describe('when using non-standard ERC20 functions for ERC20 purposes...', () => {
  contract('NoobCoin', accounts => {
    const sender = accounts[0]
    const receiver = accounts[1]
    let nc

    beforeEach('setup contract', async () => {
      nc = await NoobCoin.new()
    })

    it('should start with a balance of 100 tokens for anyone', async () => {
      const senderBalance = await nc.balanceOf(sender)
      const receiverBalance = await nc.balanceOf(receiver)

      assert.equal(
        senderBalance.toString(),
        startingBalance.toString(),
        'the sender balance, like everyone, should start at 100e18'
      )
      assert.equal(
        receiverBalance.toString(),
        startingBalance.toString(),
        'the sender balance, like everyone, should start at 100e18'
      )
    })

    it('should transfer/properly adjust from 100e18 when transfering', async () => {
      await testTransfer(nc, sender, receiver)
    })

    it('should increment totalSupply by active senders original balance when transfering', async () => {
      await testTransferIncrementTotalSupply(nc, sender, receiver)
    })

    it('should transferFrom/properly adjust from 100e18 when transfering', async () => {
      await testApprove(nc, sender, receiver)
      await testTransferFrom(nc, sender, receiver)
    })

    it('should increment totalSupply by active senders original balance when transferFrom-ing', async () => {
      await testApprove(nc, sender, receiver)
      await testTransferFromIncrementTotalSupply(nc, sender, receiver)
    })

    describe('when burning', () => {
      it('should quietly burn and NOT deduct totalSupply if burner was never actively sending', async () => {
        await testBurn(nc, receiver, sendAmount)
      })

      it('should burn with an event and deduct totalSupply if burner is considered active by having sent before', async () => {
        await testTransferIncrementTotalSupply(nc, sender, receiver)
        await testBurn(nc, sender, sendAmount)
      })
    })
  })
})
