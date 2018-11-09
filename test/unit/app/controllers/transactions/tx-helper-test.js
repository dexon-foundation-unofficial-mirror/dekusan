const assert = require('assert')
const txHelper = require('../../../../../ui/lib/tx-helper')

describe('txHelper', function () {
  it('always shows the oldest tx first', function () {
    const dekusanNetworkId = 1
    const txs = {
      a: { dekusanNetworkId, time: 3 },
      b: { dekusanNetworkId, time: 1 },
      c: { dekusanNetworkId, time: 2 },
    }

    const sorted = txHelper(txs, null, null, dekusanNetworkId)
    assert.equal(sorted[0].time, 1, 'oldest tx first')
    assert.equal(sorted[2].time, 3, 'newest tx last')
  })
})
