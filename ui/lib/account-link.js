module.exports = function (address, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
      link = `https://dexscan.org/address/${address}`
      break
    case 2: // test net
      link = `https://testnet.dexscan.org/address/${address}`
      break
    default:
      link = ''
      break
  }

  return link
}
