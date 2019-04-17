module.exports = function (txHash, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
    case 237: // main net
      link = `https://dexonscan.app/transaction/${txHash}`
      break
    case 2: // test net
    case 238: // test net
    default:
      link = `https://testnet.dexonscan.app/transaction/${txHash}`
      break
  }

  return link
}
