const abi = require('human-standard-token-abi')
import {
  transactionsSelector,
} from './selectors/transactions'
const {
  multiplyCurrencies,
} = require('./conversion-util')

const selectors = {
  getSelectedAddress,
  getSelectedIdentity,
  getSelectedAccount,
  getSelectedToken,
  getSelectedTokenExchangeRate,
  getSelectedTokenAssetImage,
  getAssetImages,
  getTokenExchangeRate,
  conversionRateSelector,
  transactionsSelector,
  accountsWithSendEtherInfoSelector,
  getCurrentAccountWithSendEtherInfo,
  getGasIsLoading,
  getForceGasMin,
  getAddressBook,
  getSendFrom,
  getCurrentCurrency,
  getNativeCurrency,
  getSendAmount,
  getSelectedTokenToFiatRate,
  getSelectedTokenContract,
  autoAddToBetaUI,
  getShouldUseNewUi,
  getSendMaxModeState,
  getCurrentViewContext,
  getTotalUnapprovedCount,
  preferencesSelector,
  getMetaMaskAccounts,
  getCurrentEthBalance,
}

module.exports = selectors

function getSelectedAddress (state) {
  const selectedAddress = state.dekusan.selectedAddress || Object.keys(getMetaMaskAccounts(state))[0]

  return selectedAddress
}

function getSelectedIdentity (state) {
  const selectedAddress = getSelectedAddress(state)
  const identities = state.dekusan.identities

  return identities[selectedAddress]
}

function getMetaMaskAccounts (state) {
  const currentAccounts = state.dekusan.accounts
  const cachedBalances = state.dekusan.cachedBalances
  const selectedAccounts = {}

  Object.keys(currentAccounts).forEach(accountID => {
    const account = currentAccounts[accountID]
    if (account && account.balance === null || account.balance === undefined) {
      selectedAccounts[accountID] = {
        ...account,
        balance: cachedBalances[accountID],
      }
    } else {
      selectedAccounts[accountID] = account
    }
  })
  return selectedAccounts
}

function getSelectedAccount (state) {
  const accounts = getMetaMaskAccounts(state)
  const selectedAddress = getSelectedAddress(state)

  return accounts[selectedAddress]
}

function getSelectedToken (state) {
  const tokens = state.dekusan.tokens || []
  const selectedTokenAddress = state.dekusan.selectedTokenAddress
  const selectedToken = tokens.filter(({ address }) => address === selectedTokenAddress)[0]
  const sendToken = state.dekusan.send.token

  return selectedToken || sendToken || null
}

function getSelectedTokenExchangeRate (state) {
  const contractExchangeRates = state.dekusan.contractExchangeRates
  const selectedToken = getSelectedToken(state) || {}
  const { address } = selectedToken
  return contractExchangeRates[address] || 0
}

function getSelectedTokenAssetImage (state) {
  const assetImages = state.dekusan.assetImages || {}
  const selectedToken = getSelectedToken(state) || {}
  const { address } = selectedToken
  return assetImages[address]
}

function getAssetImages (state) {
  const assetImages = state.dekusan.assetImages || {}
  return assetImages
}

function getTokenExchangeRate (state, address) {
  const contractExchangeRates = state.dekusan.contractExchangeRates
  return contractExchangeRates[address] || 0
}

function conversionRateSelector (state) {
  return state.dekusan.conversionRate
}

function getAddressBook (state) {
  return state.dekusan.addressBook
}

function accountsWithSendEtherInfoSelector (state) {
  const accounts = getMetaMaskAccounts(state)
  const { identities } = state.dekusan

  const accountsWithSendEtherInfo = Object.entries(accounts).map(([key, account]) => {
    return Object.assign({}, account, identities[key])
  })

  return accountsWithSendEtherInfo
}

function getCurrentAccountWithSendEtherInfo (state) {
  const currentAddress = getSelectedAddress(state)
  const accounts = accountsWithSendEtherInfoSelector(state)

  return accounts.find(({ address }) => address === currentAddress)
}

function getCurrentEthBalance (state) {
  return getCurrentAccountWithSendEtherInfo(state).balance
}

function getGasIsLoading (state) {
  return state.appState.gasIsLoading
}

function getForceGasMin (state) {
  return state.dekusan.send.forceGasMin
}

function getSendFrom (state) {
  return state.dekusan.send.from
}

function getSendAmount (state) {
  return state.dekusan.send.amount
}

function getSendMaxModeState (state) {
  return state.dekusan.send.maxModeOn
}

function getCurrentCurrency (state) {
  return state.dekusan.currentCurrency
}

function getNativeCurrency (state) {
  return state.dekusan.nativeCurrency
}

function getSelectedTokenToFiatRate (state) {
  const selectedTokenExchangeRate = getSelectedTokenExchangeRate(state)
  const conversionRate = conversionRateSelector(state)

  const tokenToFiatRate = multiplyCurrencies(
    conversionRate,
    selectedTokenExchangeRate,
    { toNumericBase: 'dec' }
  )

  return tokenToFiatRate
}

function getSelectedTokenContract (state) {
  const selectedToken = getSelectedToken(state)
  return selectedToken
    ? global.eth.contract(abi).at(selectedToken.address)
    : null
}

function autoAddToBetaUI (state) {
  const autoAddTransactionThreshold = 12
  const autoAddAccountsThreshold = 2
  const autoAddTokensThreshold = 1

  const numberOfTransactions = state.dekusan.selectedAddressTxList.length
  const numberOfAccounts = Object.keys(getMetaMaskAccounts(state)).length
  const numberOfTokensAdded = state.dekusan.tokens.length

  const userPassesThreshold = (numberOfTransactions > autoAddTransactionThreshold) &&
    (numberOfAccounts > autoAddAccountsThreshold) &&
    (numberOfTokensAdded > autoAddTokensThreshold)
  const userIsNotInBeta = !state.dekusan.featureFlags.betaUI

  return userIsNotInBeta && userPassesThreshold
}

function getShouldUseNewUi (state) {
  const isAlreadyUsingBetaUi = state.dekusan.featureFlags.betaUI
  const isMascara = state.dekusan.isMascara
  const isFreshInstall = Object.keys(state.dekusan.identities).length === 0
  return isAlreadyUsingBetaUi || isMascara || isFreshInstall
}

function getCurrentViewContext (state) {
  const { currentView = {} } = state.appState
  return currentView.context
}

function getTotalUnapprovedCount ({ dekusan }) {
  const {
    unapprovedTxs = {},
    unapprovedMsgCount,
    unapprovedPersonalMsgCount,
    unapprovedTypedMessagesCount,
  } = dekusan

  return Object.keys(unapprovedTxs).length + unapprovedMsgCount + unapprovedPersonalMsgCount +
    unapprovedTypedMessagesCount
}

function preferencesSelector ({ dekusan }) {
  return dekusan.preferences
}
