const Component = require('react').Component
const PropTypes = require('prop-types')
const h = require('react-hyperscript')
const connect = require('react-redux').connect
const classnames = require('classnames')
const inherits = require('util').inherits
const NetworkDropdownIcon = require('./dropdowns/components/network-dropdown-icon')

Network.contextTypes = {
  t: PropTypes.func,
}

module.exports = connect()(Network)


inherits(Network, Component)

function Network () {
  Component.call(this)
}

Network.prototype.render = function () {
  const props = this.props
  const context = this.context
  const networkNumber = props.network
  let providerName, providerNick
  try {
    providerName = props.provider.type
    providerNick = props.provider.nickname || ''
  } catch (e) {
    providerName = null
  }
  let iconName, hoverText

  if (networkNumber === 'loading') {
    return h('span.pointer.network-indicator', {
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
      },
      onClick: (event) => this.props.onClick(event),
    }, [
      h('img', {
        title: context.t('attemptingConnect'),
        style: {
          width: '27px',
        },
        src: 'images/loading.svg',
      }),
    ])
  } else if (providerName === 'mainnet') {
    hoverText = context.t('mainnet')
    iconName = 'dexon-network'
  } else if (providerName === 'testnet') {
    hoverText = context.t('testnet')
    iconName = 'dexon-test-network'
  } else {
    hoverText = context.t('unknownNetwork')
    iconName = 'unknown-private-network'
  }

  return (
    h('div.network-component.pointer', {
      className: classnames({
        'network-component--disabled': this.props.disabled,
        'dexon-network': providerName === 'mainnet',
        'dexon-test-network': providerName === 'testnet',
      }),
      title: hoverText,
      onClick: (event) => {
        if (!this.props.disabled) {
          this.props.onClick(event)
        }
      },
    }, [
      (function () {
        switch (iconName) {
          case 'dexon-network':
            return h('.network-indicator', [
              h(NetworkDropdownIcon, {
                backgroundColor: '#954A97', // $blue-lagoon
                nonSelectBackgroundColor: '#954A97',
              }),
              h('.network-name', context.t('mainnet')),
              h('i.fa.fa-chevron-down.fa-lg.network-caret'),
            ])
          case 'dexon-test-network':
            return h('.network-indicator', [
              h(NetworkDropdownIcon, {
                backgroundColor: '#aeaeae', // $crimson
                nonSelectBackgroundColor: '#aeaeae',
              }),
              h('.network-name', context.t('testnet')),
              h('i.fa.fa-chevron-down.fa-lg.network-caret'),
            ])
          default:
            return h('.network-indicator', [
              h('i.fa.fa-question-circle.fa-lg', {
                style: {
                  margin: '10px',
                  color: 'rgb(125, 128, 130)',
                },
              }),

              h('.network-name', providerNick || context.t('privateNetwork')),
              h('i.fa.fa-chevron-down.fa-lg.network-caret'),
            ])
        }
      })(),
    ])
  )
}
