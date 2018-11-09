module.exports = function (txHash, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
      link = `https://dexscan.org/transaction/${txHash}`
      break
    case 2: // test net
    case 237: // test net
    default:
      link = `https://testnet.dexscan.org/transaction/${txHash}`
      break
  }

  return link
}
