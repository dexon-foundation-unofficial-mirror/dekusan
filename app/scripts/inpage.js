cleanContextForImports()
const LocalMessageDuplexStream = require('post-message-stream')
const DekuSanInpageProvider = require('@dexon-foundation/dekusan-inpage-provider')
let isEnabled = false
let warned = false
let providerHandle
let isApprovedHandle
let isUnlockedHandle

restoreContextAfterImports()
/**
 * Adds a postMessage listener for a specific message type
 *
 * @param {string} messageType - postMessage type to listen for
 * @param {Function} handler - event handler
 * @param {boolean} remove - removes this handler after being triggered
 */
function onMessage (messageType, handler, remove) {
  window.addEventListener('message', function ({ data }) {
    if (!data || data.type !== messageType) { return }
    remove && window.removeEventListener('message', handler)
    handler.apply(window, arguments)
  })
}

//
// setup plugin communication
//

// setup background connection
var dekusanStream = new LocalMessageDuplexStream({
  name: 'dekuSanInpage',
  target: 'dekuSanContentscript',
})

// compose the inpage provider
var inpageProvider = new DekuSanInpageProvider(dekusanStream)
// set a high max listener count to avoid unnecesary warnings
inpageProvider.setMaxListeners(100)

// set up a listener for when MetaMask is locked
onMessage('dekusansetlocked', () => { isEnabled = false })

// set up a listener for privacy mode responses
onMessage('dexonproviderlegacy', ({ data: { selectedAddress } }) => {
  isEnabled = true
  setTimeout(() => {
    inpageProvider.publicConfigStore.updateState({ selectedAddress })
  }, 0)
}, true)

// augment the provider with its enable method
inpageProvider.enable = function ({ force } = {}) {
  return new Promise((resolve, reject) => {
    providerHandle = ({ data: { error, selectedAddress } }) => {
      if (typeof error !== 'undefined') {
        reject(error)
      } else {
        window.removeEventListener('message', providerHandle)
        setTimeout(() => {
          inpageProvider.publicConfigStore.updateState({ selectedAddress })
        }, 0)

        // wait for the background to update with an account
        inpageProvider.sendAsync({ method: 'eth_accounts', params: [] }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            isEnabled = true
            resolve(response.result)
          }
        })
      }
    }
    onMessage('dexonprovider', providerHandle, true)
    window.postMessage({ type: 'DEXON_ENABLE_PROVIDER', force }, '*')
  })
}

// add dekusan-specific convenience methods
inpageProvider._dekusan = new Proxy({
  /**
   * Determines if this domain is currently enabled
   *
   * @returns {boolean} - true if this domain is currently enabled
   */
  isEnabled: function () {
    return isEnabled
  },

  /**
   * Determines if this domain has been previously approved
   *
   * @returns {Promise<boolean>} - Promise resolving to true if this domain has been previously approved
   */
  isApproved: function () {
    return new Promise((resolve) => {
      isApprovedHandle = ({ data: { caching, isApproved } }) => {
        if (caching) {
          resolve(!!isApproved)
        } else {
          resolve(false)
        }
      }
      onMessage('ethereumisapproved', isApprovedHandle, true)
      window.postMessage({ type: 'DEXON_IS_APPROVED' }, '*')
    })
  },

  /**
   * Determines if MetaMask is unlocked by the user
   *
   * @returns {Promise<boolean>} - Promise resolving to true if MetaMask is currently unlocked
   */
  isUnlocked: function () {
    return new Promise((resolve) => {
      isUnlockedHandle = ({ data: { isUnlocked } }) => {
        resolve(!!isUnlocked)
      }
      onMessage('metamaskisunlocked', isUnlockedHandle, true)
      window.postMessage({ type: 'DEKUSAN_IS_UNLOCKED' }, '*')
    })
  },
}, {
  get: function (obj, prop) {
    !warned && console.warn('Heads up! ethereum._metamask exposes methods that have ' +
    'not been standardized yet. This means that these methods may not be implemented ' +
    'in other dapp browsers and may be removed from MetaMask in the future.')
    warned = true
    return obj[prop]
  },
})

// Work around for web3@1.0 deleting the bound `sendAsync` but not the unbound
// `sendAsync` method on the prototype, causing `this` reference issues with drizzle
const proxiedInpageProvider = new Proxy(inpageProvider, {
  // straight up lie that we deleted the property so that it doesnt
  // throw an error in strict mode
  deleteProperty: () => true,
})

window.ethereum = proxiedInpageProvider

// detect eth_requestAccounts and pipe to enable for now
function detectAccountRequest (method) {
  const originalMethod = inpageProvider[method]
  inpageProvider[method] = function ({ method }) {
    if (method === 'eth_requestAccounts') {
      return window.ethereum.enable()
    }
    return originalMethod.apply(this, arguments)
  }
}
detectAccountRequest('send')
detectAccountRequest('sendAsync')

// set web3 defaultAccount
inpageProvider.publicConfigStore.subscribe(function (state) {
  web3.eth.defaultAccount = state.selectedAddress
})

// expose provider
window.dexon = proxiedInpageProvider

// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
var __define

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
function cleanContextForImports () {
  __define = global.define
  try {
    global.define = undefined
  } catch (_) {
    console.warn('DekuSan - global.define could not be deleted.')
  }
}

/**
 * Restores global define object from cached reference
 */
function restoreContextAfterImports () {
  try {
    global.define = __define
  } catch (_) {
    console.warn('DekuSan - global.define could not be overwritten.')
  }
}
