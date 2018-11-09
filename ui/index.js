const render = require('react-dom').render
const h = require('react-hyperscript')
const Root = require('./app/root')
const actions = require('./app/actions')
const configureStore = require('./app/store')
const txHelper = require('./lib/tx-helper')
const { fetchLocale } = require('./i18n-helper')
const log = require('loglevel')

module.exports = launchMetamaskUi

log.setLevel(global.METAMASK_DEBUG ? 'debug' : 'warn')

function launchMetamaskUi (opts, cb) {
  var accountManager = opts.accountManager
  actions._setBackgroundConnection(accountManager)
  // check if we are unlocked first
  accountManager.getState(function (err, dekusanState) {
    if (err) return cb(err)
    startApp(dekusanState, accountManager, opts)
      .then((store) => {
        cb(null, store)
      })
  })
}

async function startApp (dekusanState, accountManager, opts) {
  // parse opts
  if (!dekusanState.featureFlags) dekusanState.featureFlags = {}

  const currentLocaleMessages = dekusanState.currentLocale
    ? await fetchLocale(dekusanState.currentLocale)
    : {}
  const enLocaleMessages = await fetchLocale('en')

  const store = configureStore({

    // dekusanState represents the cross-tab state
    dekusan: dekusanState,

    // appState represents the current tab's popup state
    appState: {},

    localeMessages: {
      current: currentLocaleMessages,
      en: enLocaleMessages,
    },

    // Which blockchain we are using:
    networkVersion: opts.networkVersion,
  })

  // if unconfirmed txs, start on txConf page
  const unapprovedTxsAll = txHelper(dekusanState.unapprovedTxs, dekusanState.unapprovedMsgs, dekusanState.unapprovedPersonalMsgs, dekusanState.unapprovedTypedMessages, dekusanState.network)
  const numberOfUnapprivedTx = unapprovedTxsAll.length
  if (numberOfUnapprivedTx > 0) {
    store.dispatch(actions.showConfTxPage({
      id: unapprovedTxsAll[numberOfUnapprivedTx - 1].id,
    }))
  }

  accountManager.on('update', function (dekusanState) {
    store.dispatch(actions.updateMetamaskState(dekusanState))
  })

  // global dekusan api - used by tooling
  global.dekusan = {
    updateCurrentLocale: (code) => {
      store.dispatch(actions.updateCurrentLocale(code))
    },
    setProviderType: (type) => {
      store.dispatch(actions.setProviderType(type))
    },
  }

  // start app
  render(
    h(Root, {
      // inject initial state
      store: store,
    }
  ), opts.container)

  return store
}
