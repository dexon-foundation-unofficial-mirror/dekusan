module.exports = function (network) {
  const net = parseInt(network)
  let prefix
  switch (net) {
    case 1: // main net
      prefix = ''
      break
    case 2: // test net
      prefix = 'testnet.'
      break
    case 3: // ropsten test net
      prefix = 'ropsten.'
      break
    case 4: // test net
      prefix = 'testnet.'
      break
    case 42: // kovan test net
      prefix = 'kovan.'
      break
    default:
      prefix = ''
  }
  return prefix
}
