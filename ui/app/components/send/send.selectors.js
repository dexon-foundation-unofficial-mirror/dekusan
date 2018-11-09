const { valuesFor } = require('../../util')
const abi = require('human-standard-token-abi')
const {
  multiplyCurrencies,
} = require('../../conversion-util')
const {
  getMetaMaskAccounts,
} = require('../../selectors')
const {
  estimateGasPriceFromRecentBlocks,
  calcGasTotal,
} = require('./send.utils')
import {
  getFastPriceEstimateInHexWEI,
} from '../../selectors/custom-gas'

const selectors = {
  accountsWithSendEtherInfoSelector,
  // autoAddToBetaUI,
  getAddressBook,
  getAmountConversionRate,
  getBlockGasLimit,
  getConversionRate,
  getCurrentAccountWithSendEtherInfo,
  getCurrentCurrency,
  getCurrentNetwork,
  getCurrentViewContext,
  getForceGasMin,
  getNativeCurrency,
  getGasLimit,
  getGasPrice,
  getGasPriceFromRecentBlocks,
  getGasTotal,
  getPrimaryCurrency,
  getRecentBlocks,
  getSelectedAccount,
  getSelectedAddress,
  getSelectedIdentity,
  getSelectedToken,
  getSelectedTokenContract,
  getSelectedTokenExchangeRate,
  getSelectedTokenToFiatRate,
  getSendAmount,
  getSendHexData,
  getSendHexDataFeatureFlagState,
  getSendEditingTransactionId,
  getSendErrors,
  getSendFrom,
  getSendFromBalance,
  getSendFromObject,
  getSendMaxModeState,
  getSendTo,
  getSendToAccounts,
  getTokenBalance,
  getTokenExchangeRate,
  getUnapprovedTxs,
  transactionsSelector,
  getQrCodeData,
}

module.exports = selectors

function accountsWithSendEtherInfoSelector (state) {
  const accounts = getMetaMaskAccounts(state)
  const { identities } = state.dekusan

  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

// function autoAddToBetaUI (state) {
//   const autoAddTransactionThreshold = 12
//   const autoAddAccountsThreshold = 2
//   const autoAddTokensThreshold = 1

//   const numberOfTransactions = state.metamask.selectedAddressTxList.length
//   const numberOfAccounts = Object.keys(getMetaMaskAccounts(state)).length
//   const numberOfTokensAdded = state.metamask.tokens.length

//   const userPassesThreshold = (numberOfTransactions > autoAddTransactionThreshold) &&
//     (numberOfAccounts > autoAddAccountsThreshold) &&
//     (numberOfTokensAdded > autoAddTokensThreshold)
//   const userIsNotInBeta = !state.dekusan.featureFlags.betaUI

//   return userIsNotInBeta && userPassesThreshold
// }

function getAddressBook (state) {
  return state.dekusan.addressBook
}

function getAmountConversionRate (state) {
  return getSelectedToken(state)
    ? getSelectedTokenToFiatRate(state)
    : getConversionRate(state)
}

function getBlockGasLimit (state) {
  return state.dekusan.currentBlockGasLimit
}

function getConversionRate (state) {
  return state.dekusan.conversionRate
}

function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

function getCurrentCurrency (state) {
  return state.dekusan.currentCurrency
}

function getNativeCurrency (state) {
  return state.metamask.nativeCurrency
}

function getCurrentNetwork (state) {
  return state.dekusan.network
}

function getCurrentViewContext (state) {
  const { currentView = {} } = state.appState
  return currentView.context
}

function getForceGasMin (state) {
  return state.dekusan.send.forceGasMin
}

function getGasLimit (state) {
  return state.dekusan.send.gasLimit || '0'
}

function getGasPrice (state) {
  return state.dekusan.send.gasPrice || getFastPriceEstimateInHexWEI(state)
}

function getGasPriceFromRecentBlocks (state) {
  return estimateGasPriceFromRecentBlocks(state.dekusan.recentBlocks)
}

function getGasTotal (state) {
  return calcGasTotal(getGasLimit(state), getGasPrice(state))
}

function getPrimaryCurrency (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken && selectedToken.symbol
}

function getRecentBlocks (state) {
  return state.dekusan.recentBlocks
}

function getSelectedAccount (state) {
  const accounts = getMetaMaskAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

function getSelectedAddress (state) {
  const selectedAddress = state.dekusan.selectedAddress || Object.keys(getMetaMaskAccounts(state))[0]

  return selectedAddress
}

function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.dekusan.identities

  return identities[selectedAddress]
}

function getSelectedToken (state) {
  const tokens = state.dekusan.tokens || []
  const selectedTokenAddress = state.dekusan.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.dekusan.send.token

  return selectedToken || sendToken || null
}

function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)

  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

function getSelectedTokenExchangeRate (state) {
  const tokenExchangeRates = state.dekusan.tokenExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { symbol = '' } = selectedToken
  const pair = `${symbol.toLowerCase()}_eth`
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates && tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = getConversionRate(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

function getSendAmount (state) {
  return state.dekusan.send.amount
}

function getSendHexData (state) {
  return state.dekusan.send.data
}

function getSendHexDataFeatureFlagState (state) {
  return state.dekusan.featureFlags.sendHexData
}

function getSendEditingTransactionId (state) {
  return state.dekusan.send.editingTransactionId
}

function getSendErrors (state) {
  return state.send.errors
}

function getSendFrom (state) {
  return state.dekusan.send.from
}

function getSendFromBalance (state) {
  const from = getSendFrom(state) || getSelectedAccount(state)
  return from.balance
}

function getSendFromObject (state) {
  return getSendFrom(state) || getCurrentAccountWithSendEtherInfo(state)
}

function getSendMaxModeState (state) {
  return state.dekusan.send.maxModeOn
}

function getSendTo (state) {
  return state.dekusan.send.to
}

function getSendToAccounts (state) {
  const fromAccounts = accountsWithSendEtherInfoSelector(state)
  const addressBookAccounts = getAddressBook(state)
  const allAccounts = [...fromAccounts, ...addressBookAccounts]
  // TODO: figure out exactly what the below returns and put a descriptive variable name on it
  return Object.entries(allAccounts).map(([key, account]) => account)
}

function getTokenBalance (state) {
  return state.dekusan.send.tokenBalance
}

function getTokenExchangeRate (state, tokenSymbol) {
  const pair = `${tokenSymbol.toLowerCase()}_eth`
  const tokenExchangeRates = state.dekusan.tokenExchangeRates
  const { rate: tokenExchangeRate = 0 } = tokenExchangeRates[pair] || {}

  return tokenExchangeRate
}

function getUnapprovedTxs (state) {
  return state.dekusan.unapprovedTxs
}

function transactionsSelector (state) {
  const { network, selectedTokenAddress } = state.dekusan
  const unapprovedMsgs = valuesFor(state.dekusan.unapprovedMsgs)
  const shapeShiftTxList = (network === '1') ? state.dekusan.shapeShiftTxList : undefined
  const transactions = state.dekusan.selectedAddressTxList || []
  const txsToRender = !shapeShiftTxList ? transactions.concat(unapprovedMsgs) : transactions.concat(unapprovedMsgs, shapeShiftTxList)

  return selectedTokenAddress
    ? txsToRender
      .filter(({ txParams }) => txParams && txParams.to === selectedTokenAddress)
      .sort((a, b) => b.time - a.time)
    : txsToRender
      .sort((a, b) => b.time - a.time)
}

function getQrCodeData (state) {
  return state.appState.qrCodeData
}
