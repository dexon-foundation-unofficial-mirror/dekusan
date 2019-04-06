import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../../button'
import TextField from '../../text-field'
import { ENVIRONMENT_TYPE_POPUP } from '../../../../../app/scripts/lib/enums'
import { getEnvironmentType } from '../../../../../app/scripts/lib/util'
import getCaretCoordinates from 'textarea-caret'
import { EventEmitter } from 'events'
import { DEFAULT_ROUTE, RESTORE_VAULT_ROUTE } from '../../../routes'

export default class UnlockPage extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    forgotPassword: PropTypes.func,
    tryUnlockMetamask: PropTypes.func,
    markPasswordForgotten: PropTypes.func,
    history: PropTypes.object,
    isUnlocked: PropTypes.bool,
    useOldInterface: PropTypes.func,
  }

  constructor (props) {
    super(props)

    this.state = {
      password: '',
      error: null,
    }

    this.submitting = false
    this.animationEventEmitter = new EventEmitter()
  }

  componentWillMount () {
    const { isUnlocked, history } = this.props

    if (isUnlocked) {
      history.push(DEFAULT_ROUTE)
    }
  }

  async handleSubmit (event) {
    event.preventDefault()
    event.stopPropagation()

    const { password } = this.state
    const { tryUnlockMetamask, history } = this.props

    if (password === '' || this.submitting) {
      return
    }

    this.setState({ error: null })
    this.submitting = true

    try {
      await tryUnlockMetamask(password)
      this.submitting = false
      history.push(DEFAULT_ROUTE)
    } catch ({ message }) {
      this.setState({ error: message })
      this.submitting = false
    }
  }

  handleInputChange ({ target }) {
    this.setState({ password: target.value, error: null })

    // tell mascot to look at page action
    const element = target
    const boundingRect = element.getBoundingClientRect()
    const coordinates = getCaretCoordinates(element, element.selectionEnd)
    this.animationEventEmitter.emit('point', {
      x: boundingRect.left + coordinates.left - element.scrollLeft,
      y: boundingRect.top + coordinates.top - element.scrollTop,
    })
  }

  renderSubmitButton () {
    return (
      <Button
        type="primary"
        large
        disabled={!this.state.password}
        fullWidth
        onClick={event => this.handleSubmit(event)}
      >
        { this.context.t('login') }
      </Button>
    )
  }

  render () {
    const { password, error } = this.state
    const { t } = this.context
    const { markPasswordForgotten, history } = this.props

    return (
      <div className="unlock-page__container">
        <div className="unlock-page">
          <div className="unlock-page__mascot-container">
            <img
              src="/images/dexon-wallet-name.svg"
              width={240}
              height={54}
            />
          </div>
          {/* <h1 className="unlock-page__title">
            {t('appName') }
          </h1> */}
          <form
            className="unlock-page__form"
            onSubmit={event => this.handleSubmit(event)}
          >
            <TextField
              id="password"
              label={t('password')}
              type="password"
              value={password}
              onChange={event => this.handleInputChange(event)}
              error={error}
              autoFocus
              autoComplete="current-password"
              fullWidth
              largeLabel
            />
          </form>
          { this.renderSubmitButton() }
          <div className="unlock-page__links">
            <div
              className="unlock-page__link"
              onClick={() => {
                markPasswordForgotten()
                history.push(RESTORE_VAULT_ROUTE)

                if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP) {
                  global.platform.openExtensionInBrowser()
                }
              }}
            >
              { t('restoreFromSeed') }
            </div>
            <div
              className="unlock-page__link unlock-page__link--import"
              onClick={() => {
                markPasswordForgotten()
                history.push(RESTORE_VAULT_ROUTE)

                if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_POPUP) {
                  global.platform.openExtensionInBrowser()
                }
              }}
            >
              { t('importUsingSeed') }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
