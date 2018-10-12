module.exports = function (address, network) {
  const net = parseInt(network)
  let link
  switch (net) {
    case 1: // main net
      link = `https://etherscan.io/address/${address}`
      break
    case 2: // test net
      link = `https://morden.etherscan.io/address/${address}`
      break
    default:
      link = ''
      break
  }

  return link
}
