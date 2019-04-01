const extend = require('xtend')
const actions = require('../actions')
const MetamascaraPlatform = require('../../../app/scripts/platforms/window')
const { getEnvironmentType } = require('../../../app/scripts/lib/util')
const { ENVIRONMENT_TYPE_POPUP } = require('../../../app/scripts/lib/enums')
const { TESTNET } = require('../../../app/scripts/controllers/network/enums')

module.exports = reduceDekusan

function reduceDekusan (state, action) {
  let newState

  // clone + defaults
  var dekusanState = extend({
    isInitialized: false,
    isUnlocked: false,
    isAccountMenuOpen: false,
    isMascara: window.platform instanceof MetamascaraPlatform,
    isPopup: getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP,
    rpcTarget: 'https://testnet-rpc.dexon.org/',
    identities: {},
    unapprovedTxs: {},
    noActiveNotices: true,
    nextUnreadNotice: undefined,
    frequentRpcList: [],
    addressBook: [],
    selectedTokenAddress: null,
    contractExchangeRates: {},
    tokenExchangeRates: {},
    tokens: [],
    pendingTokens: {},
    send: {
      gasLimit: null,
      gasPrice: null,
      gasTotal: null,
      tokenBalance: '0x0',
      from: '',
      to: '',
      amount: '0x0',
      memo: '',
      errors: {},
      maxModeOn: false,
      editingTransactionId: null,
      forceGasMin: null,
      toNickname: '',
    },
    coinOptions: {},
    useBlockie: false,
    featureFlags: {},
    networkEndpointType: TESTNET,
    isRevealingSeedWords: false,
    welcomeScreenSeen: false,
    currentLocale: '',
    preferences: {
      useNativeCurrencyAsPrimaryCurrency: true,
    },
  }, state.dekusan)

  switch (action.type) {

    case actions.SHOW_ACCOUNTS_PAGE:
      newState = extend(dekusanState, {
        isRevealingSeedWords: false,
      })
      delete newState.seedWords
      return newState

    case actions.SHOW_NOTICE:
      return extend(dekusanState, {
        noActiveNotices: false,
        nextUnreadNotice: action.value,
      })

    case actions.CLEAR_NOTICES:
      return extend(dekusanState, {
        noActiveNotices: true,
        nextUnreadNotice: undefined,
      })

    case actions.UPDATE_METAMASK_STATE:
      return extend(dekusanState, action.value)

    case actions.UNLOCK_METAMASK:
      return extend(dekusanState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })

    case actions.LOCK_METAMASK:
      return extend(dekusanState, {
        isUnlocked: false,
      })

    case actions.SET_RPC_LIST:
      return extend(dekusanState, {
        frequentRpcList: action.value,
      })

    case actions.SET_RPC_TARGET:
      return extend(dekusanState, {
        provider: {
          type: 'rpc',
          rpcTarget: action.value,
        },
      })

    case actions.SET_PROVIDER_TYPE:
      return extend(dekusanState, {
        provider: {
          type: action.value,
        },
      })

    case actions.COMPLETED_TX:
      var stringId = String(action.id)
      newState = extend(dekusanState, {
        unapprovedTxs: {},
        unapprovedMsgs: {},
      })
      for (const id in dekusanState.unapprovedTxs) {
        if (id !== stringId) {
          newState.unapprovedTxs[id] = dekusanState.unapprovedTxs[id]
        }
      }
      for (const id in dekusanState.unapprovedMsgs) {
        if (id !== stringId) {
          newState.unapprovedMsgs[id] = dekusanState.unapprovedMsgs[id]
        }
      }
      return newState

    case actions.EDIT_TX:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          editingTransactionId: action.value,
        },
      })


    case actions.SHOW_NEW_VAULT_SEED:
      return extend(dekusanState, {
        isRevealingSeedWords: true,
        seedWords: action.value,
      })

    case actions.CLEAR_SEED_WORD_CACHE:
      newState = extend(dekusanState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      delete newState.seedWords
      return newState

    case actions.SHOW_ACCOUNT_DETAIL:
      newState = extend(dekusanState, {
        isUnlocked: true,
        isInitialized: true,
        selectedAddress: action.value,
      })
      delete newState.seedWords
      return newState

    case actions.SET_SELECTED_TOKEN:
      return extend(dekusanState, {
        selectedTokenAddress: action.value,
      })

    case actions.SET_ACCOUNT_LABEL:
      const account = action.value.account
      const name = action.value.label
      const id = {}
      id[account] = extend(dekusanState.identities[account], { name })
      const identities = extend(dekusanState.identities, id)
      return extend(dekusanState, { identities })

    case actions.SET_CURRENT_FIAT:
      return extend(dekusanState, {
        currentCurrency: action.value.currentCurrency,
        conversionRate: action.value.conversionRate,
        conversionDate: action.value.conversionDate,
      })

    case actions.UPDATE_TOKENS:
      return extend(dekusanState, {
        tokens: action.newTokens,
      })

    // metamask.send
    case actions.UPDATE_GAS_LIMIT:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          gasLimit: action.value,
        },
      })

    case actions.UPDATE_GAS_PRICE:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          gasPrice: action.value,
        },
      })

    case actions.TOGGLE_ACCOUNT_MENU:
      return extend(dekusanState, {
        isAccountMenuOpen: !dekusanState.isAccountMenuOpen,
      })

    case actions.UPDATE_GAS_TOTAL:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          gasTotal: action.value,
        },
      })

    case actions.UPDATE_SEND_TOKEN_BALANCE:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          tokenBalance: action.value,
        },
      })

    case actions.UPDATE_SEND_HEX_DATA:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          data: action.value,
        },
      })

    case actions.UPDATE_SEND_FROM:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          from: action.value,
        },
      })

    case actions.UPDATE_SEND_TO:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          to: action.value.to,
          toNickname: action.value.nickname,
        },
      })

    case actions.UPDATE_SEND_AMOUNT:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          amount: action.value,
        },
      })

    case actions.UPDATE_SEND_MEMO:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          memo: action.value,
        },
      })

    case actions.UPDATE_MAX_MODE:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          maxModeOn: action.value,
        },
      })

    case actions.UPDATE_SEND:
      return extend(dekusanState, {
        send: {
          ...dekusanState.send,
          ...action.value,
        },
      })

    case actions.CLEAR_SEND:
      return extend(dekusanState, {
        send: {
          gasLimit: null,
          gasPrice: null,
          gasTotal: null,
          tokenBalance: null,
          from: '',
          to: '',
          amount: '0x0',
          memo: '',
          errors: {},
          maxModeOn: false,
          editingTransactionId: null,
          forceGasMin: null,
          toNickname: '',
        },
      })

    case actions.UPDATE_TRANSACTION_PARAMS:
      const { id: txId, value } = action
      let { selectedAddressTxList } = dekusanState
      selectedAddressTxList = selectedAddressTxList.map(tx => {
        if (tx.id === txId) {
          tx.txParams = value
        }
        return tx
      })

      return extend(dekusanState, {
        selectedAddressTxList,
      })

    case actions.PAIR_UPDATE:
      const { value: { marketinfo: pairMarketInfo } } = action
      return extend(dekusanState, {
        tokenExchangeRates: {
          ...dekusanState.tokenExchangeRates,
          [pairMarketInfo.pair]: pairMarketInfo,
        },
      })

    case actions.SHAPESHIFT_SUBVIEW:
      const { value: { marketinfo: ssMarketInfo, coinOptions } } = action
      return extend(dekusanState, {
        tokenExchangeRates: {
          ...dekusanState.tokenExchangeRates,
          [ssMarketInfo.pair]: ssMarketInfo,
        },
        coinOptions,
      })

    case actions.SET_USE_BLOCKIE:
      return extend(dekusanState, {
        useBlockie: action.value,
      })

    case actions.UPDATE_FEATURE_FLAGS:
      return extend(dekusanState, {
        featureFlags: action.value,
      })

    case actions.UPDATE_NETWORK_ENDPOINT_TYPE:
      return extend(dekusanState, {
        networkEndpointType: action.value,
      })

    case actions.CLOSE_WELCOME_SCREEN:
      return extend(dekusanState, {
        welcomeScreenSeen: true,
      })

    case actions.SET_CURRENT_LOCALE:
      return extend(dekusanState, {
        currentLocale: action.value,
      })

    case actions.SET_PENDING_TOKENS:
      return extend(dekusanState, {
        pendingTokens: { ...action.payload },
      })

    case actions.CLEAR_PENDING_TOKENS: {
      return extend(dekusanState, {
        pendingTokens: {},
      })
    }

    case actions.UPDATE_PREFERENCES: {
      return extend(dekusanState, {
        preferences: { ...action.payload },
      })
    }

    default:
      return dekusanState

  }
}
