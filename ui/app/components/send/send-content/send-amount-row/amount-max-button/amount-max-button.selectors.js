const selectors = {
  getMaxModeOn,
}

module.exports = selectors

function getMaxModeOn (state) {
  return state.dekusan.send.maxModeOn
}
