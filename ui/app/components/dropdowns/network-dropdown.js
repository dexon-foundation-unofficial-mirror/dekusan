const Component = require('react').Component
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const inherits = require('util').inherits
const connect = require('react-redux').connect
const { withRouter } = require('react-router-dom')
const { compose } = require('recompose')
const actions = require('../../actions')
const Dropdown = require('./components/dropdown').Dropdown
const DropdownMenuItem = require('./components/dropdown').DropdownMenuItem
const NetworkDropdownIcon = require('./components/network-dropdown-icon')
const R = require('ramda')
const { SETTINGS_ROUTE } = require('../../routes')

// classes from nodes of the toggle element.
const notToggleElementClassnames = [
  'menu-icon',
  'network-name',
  'network-indicator',
  'network-caret',
  'network-component',
]

function mapStateToProps (state) {
  return {
    provider: state.dekusan.provider,
    frequentRpcListDetail: state.dekusan.frequentRpcListDetail || [],
    networkDropdownOpen: state.appState.networkDropdownOpen,
    network: state.dekusan.network,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    hideModal: () => {
      dispatch(actions.hideModal())
    },
    setProviderType: (type) => {
      dispatch(actions.setProviderType(type))
    },
    setDefaultRpcTarget: type => {
      dispatch(actions.setDefaultRpcTarget(type))
    },
    setRpcTarget: (target, network, ticker, nickname) => {
      dispatch(actions.setRpcTarget(target, network, ticker, nickname))
    },
    delRpcTarget: (target) => {
      dispatch(actions.delRpcTarget(target))
    },
    showNetworkDropdown: () => dispatch(actions.showNetworkDropdown()),
    hideNetworkDropdown: () => dispatch(actions.hideNetworkDropdown()),
  }
}


inherits(NetworkDropdown, Component)
function NetworkDropdown () {
  Component.call(this)
}

NetworkDropdown.contextTypes = {
  t: PropTypes.func,
}

module.exports = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(NetworkDropdown)


// TODO: specify default props and proptypes
NetworkDropdown.prototype.render = function () {
  const props = this.props
  const { provider: { type: providerType, rpcTarget: activeNetwork } } = props
  const rpcListDetail = props.frequentRpcListDetail
  const isOpen = this.props.networkDropdownOpen
  const dropdownMenuItemStyle = {
    fontSize: '16px',
    lineHeight: '20px',
    padding: '12px 0',
  }

  return h(Dropdown, {
    isOpen,
    onClickOutside: (event) => {
      const { classList } = event.target
      const isInClassList = className => classList.contains(className)
      const notToggleElementIndex = R.findIndex(isInClassList)(notToggleElementClassnames)

      if (notToggleElementIndex === -1) {
        this.props.hideNetworkDropdown()
      }
    },
    containerClassName: 'network-droppo',
    zIndex: 55,
    style: {
      position: 'absolute',
      top: '58px',
      width: '309px',
      zIndex: '55px',
    },
    innerStyle: {
      padding: '18px 8px',
    },
  }, [

    h('div.network-dropdown-header', {}, [
      h('div.network-dropdown-title', {}, this.context.t('networks')),

      h('div.network-dropdown-divider'),

      h('div.network-dropdown-content',
        {},
        this.context.t('defaultNetwork')
      ),
    ]),

    h(
      DropdownMenuItem,
      {
        key: 'mainnet',
        closeMenu: () => this.props.hideNetworkDropdown(),
        onClick: () => props.setProviderType('mainnet'),
        style: dropdownMenuItemStyle,
      },
      [
        providerType === 'mainnet' ? h('i.fa.fa-check') : h('.network-check__transparent', '✓'),
        h(NetworkDropdownIcon, {
          backgroundColor: '#954A97', // $silver-chalice
          isSelected: providerType === 'mainnet',
        }),
        h('span.network-name-item', {
          style: {
            color: providerType === 'mainnet' ? '#ffffff' : '#9b9b9b',
          },
        }, this.context.t('mainnet')),
      ]
    ),

    h(
      DropdownMenuItem,
      {
        key: 'testnet',
        closeMenu: () => this.props.hideNetworkDropdown(),
        onClick: () => props.setProviderType('testnet'),
        style: dropdownMenuItemStyle,
      },
      [
        providerType === 'testnet' ? h('i.fa.fa-check') : h('.network-check__transparent', '✓'),
        h(NetworkDropdownIcon, {
          backgroundColor: '#954A97', // $dexon-purple
          isSelected: providerType === 'testnet',
        }),
        h('span.network-name-item', {
          style: {
            color: providerType === 'testnet' ? '#ffffff' : '#9b9b9b',
          },
        }, this.context.t('testnet')),
      ]
    ),

    h(
      DropdownMenuItem,
      {
        key: 'default',
        closeMenu: () => this.props.hideNetworkDropdown(),
        onClick: () => props.setProviderType('localhost'),
        style: dropdownMenuItemStyle,
      },
      [
        providerType === 'localhost' ? h('i.fa.fa-check') : h('.network-check__transparent', '✓'),
        h(NetworkDropdownIcon, {
          isSelected: providerType === 'localhost',
          innerBorder: '1px solid #9b9b9b',
        }),
        h('span.network-name-item', {
          style: {
            color: providerType === 'localhost' ? '#ffffff' : '#9b9b9b',
          },
        }, this.context.t('localhost')),
      ]
    ),

    this.renderCustomOption(props.provider),
    this.renderCommonRpc(rpcListDetail, props.provider),

    h(
      DropdownMenuItem,
      {
        closeMenu: () => this.props.hideNetworkDropdown(),
        onClick: () => this.props.history.push(SETTINGS_ROUTE),
        style: dropdownMenuItemStyle,
      },
      [
        activeNetwork === 'custom' ? h('i.fa.fa-check') : h('.network-check__transparent', '✓'),
        h(NetworkDropdownIcon, {
          isSelected: activeNetwork === 'custom',
          innerBorder: '1px solid #9b9b9b',
        }),
        h('span.network-name-item', {
          style: {
            color: activeNetwork === 'custom' ? '#ffffff' : '#9b9b9b',
          },
        }, this.context.t('customRPC')),
      ]
    ),

  ])
}


NetworkDropdown.prototype.getNetworkName = function () {
  const { provider } = this.props
  const providerName = provider.type

  let name

  if (providerName === 'mainnet') {
    name = this.context.t('mainnet')
  } else if (providerName === 'testnet') {
    name = this.context.t('testnet')
  } else {
    name = provider.nickname || this.context.t('unknownNetwork')
  }

  return name
}

NetworkDropdown.prototype.renderCommonRpc = function (rpcListDetail, provider) {
  const props = this.props
  const reversedRpcListDetail = rpcListDetail.slice().reverse()
  const network = props.network

  return reversedRpcListDetail.map((entry) => {
    const rpc = entry.rpcUrl
    const ticker = entry.ticker || 'DXN'
    const nickname = entry.nickname || ''
    const currentRpcTarget = provider.type === 'rpc' && rpc === provider.rpcTarget

    if ((rpc === 'http://localhost:8545') || currentRpcTarget) {
      return null
    } else {
      const chainId = entry.chainId || network
      return h(
        DropdownMenuItem,
        {
          key: `common${rpc}`,
          closeMenu: () => this.props.hideNetworkDropdown(),
          onClick: () => props.setRpcTarget(rpc, chainId, ticker, nickname),
          style: {
            fontSize: '16px',
            lineHeight: '20px',
            padding: '12px 0',
          },
        },
        [
          currentRpcTarget ? h('i.fa.fa-check') : h('.network-check__transparent', '✓'),
          // h('i.fa.fa-question-circle.fa-med.menu-icon-circle'),
          h('span.network-name-item', {
            style: {
              color: currentRpcTarget ? '#ffffff' : '#9b9b9b',
            },
          }, nickname || rpc),
          h('i.fa.fa-times.delete',
          {
            onClick: (e) => {
              e.stopPropagation()
              props.delRpcTarget(rpc)
            },
          }),
        ]
      )
    }
  })
}

NetworkDropdown.prototype.renderCustomOption = function (provider) {
  const { rpcTarget, type, ticker, nickname } = provider
  const props = this.props
  const network = props.network

  if (type !== 'rpc') return null

  switch (rpcTarget) {

    case 'http://localhost:8545':
      return null

    default:
      return h(
        DropdownMenuItem,
        {
          key: rpcTarget,
          onClick: () => props.setRpcTarget(rpcTarget, network, ticker, nickname),
          closeMenu: () => this.props.hideNetworkDropdown(),
          style: {
            fontSize: '16px',
            lineHeight: '20px',
            padding: '12px 0',
          },
        },
        [
          h('i.fa.fa-check'),
          // h('i.fa.fa-question-circle.fa-med.menu-icon-circle'),
          h('span.network-name-item', {
            style: {
              color: '#ffffff',
            },
          }, nickname || rpcTarget),
        ]
      )
  }
}
