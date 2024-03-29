import {validateMnemonic} from 'bip39'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  createNewVaultAndRestore,
  unMarkPasswordForgotten,
} from '../../../../ui/app/actions'
import { INITIALIZE_NOTICE_ROUTE } from '../../../../ui/app/routes'
import TextField from '../../../../ui/app/components/text-field'

class ImportSeedPhraseScreen extends Component {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    warning: PropTypes.string,
    createNewVaultAndRestore: PropTypes.func.isRequired,
    leaveImportSeedScreenState: PropTypes.func,
    history: PropTypes.object,
    isLoading: PropTypes.bool,
  };

  state = {
    seedPhrase: '',
    password: '',
    confirmPassword: '',
    seedPhraseError: null,
    passwordError: null,
    confirmPasswordError: null,
  }

  parseSeedPhrase = (seedPhrase) => {
    return seedPhrase
      .trim()
      .match(/\w+/g)
      .join(' ')
  }

  handleSeedPhraseChange (seedPhrase) {
    let seedPhraseError = null

    if (seedPhrase) {
      const parsedSeedPhrase = this.parseSeedPhrase(seedPhrase)
      const numberOfWords = parsedSeedPhrase.split(' ').length
      if (numberOfWords !== 12 && numberOfWords !== 24) {
        seedPhraseError = this.context.t('seedPhraseReq')
      } else if (!validateMnemonic(parsedSeedPhrase)) {
        seedPhraseError = this.context.t('invalidSeedPhrase')
      }
    }

    this.setState({ seedPhrase, seedPhraseError })
  }

  handlePasswordChange (password) {
    const { confirmPassword } = this.state
    let confirmPasswordError = null
    let passwordError = null

    if (password && password.length < 8) {
      passwordError = this.context.t('passwordNotLongEnough')
    }

    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch')
    }

    this.setState({ password, passwordError, confirmPasswordError })
  }

  handleConfirmPasswordChange (confirmPassword) {
    const { password } = this.state
    let confirmPasswordError = null

    if (password !== confirmPassword) {
      confirmPasswordError = this.context.t('passwordsDontMatch')
    }

    this.setState({ confirmPassword, confirmPasswordError })
  }

  onClick = () => {
    const { password, seedPhrase } = this.state
    const {
      createNewVaultAndRestore,
      leaveImportSeedScreenState,
      history,
    } = this.props

    leaveImportSeedScreenState()
    createNewVaultAndRestore(password, this.parseSeedPhrase(seedPhrase))
      .then(() => history.push(INITIALIZE_NOTICE_ROUTE))
  }

  hasError () {
    const { passwordError, confirmPasswordError, seedPhraseError } = this.state
    return passwordError || confirmPasswordError || seedPhraseError
  }

  render () {
    const {
      seedPhrase,
      password,
      confirmPassword,
      seedPhraseError,
      passwordError,
      confirmPasswordError,
    } = this.state
    const { t } = this.context
    const { isLoading } = this.props
    const disabled = !seedPhrase || !password || !confirmPassword || isLoading || this.hasError()

    return (
      <div className="first-view-main-wrapper">
        <div className="first-view-main">
          <div className="import-account">
            <a
              className="import-account__back-button"
              onClick={e => {
                e.preventDefault()
                this.props.history.goBack()
              }}
              href="#"
            >
              {`< Back`}
            </a>
            <div className="import-account__title">
              Import an Account with Seed Phrase
            </div>
            <div className="import-account__selector-label">
              Enter your secret twelve word phrase here to restore your vault.
            </div>
            <div className="import-account__input-wrapper">
              <label className="import-account__input-label">Wallet Seed</label>
              <textarea
                className="import-account__secret-phrase"
                onChange={e => this.handleSeedPhraseChange(e.target.value)}
                value={this.state.seedPhrase}
                placeholder="Separate each word with a single space"
              />
            </div>
            <span className="error">
              { seedPhraseError }
            </span>
            <TextField
              id="password"
              label={t('newPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.password}
              onChange={event => this.handlePasswordChange(event.target.value)}
              error={passwordError}
              autoComplete="new-password"
              margin="normal"
              largeLabel
            />
            <TextField
              id="confirm-password"
              label={t('confirmPassword')}
              type="password"
              className="first-time-flow__input"
              value={this.state.confirmPassword}
              onChange={event => this.handleConfirmPasswordChange(event.target.value)}
              error={confirmPasswordError}
              autoComplete="confirm-password"
              margin="normal"
              largeLabel
            />
            <button
              className="first-time-flow__button"
              onClick={() => !disabled && this.onClick()}
              disabled={disabled}
            >
              Import
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  ({ appState: { warning, isLoading } }) => ({ warning, isLoading }),
  dispatch => ({
    leaveImportSeedScreenState: () => {
      dispatch(unMarkPasswordForgotten())
    },
    createNewVaultAndRestore: (pw, seed) => dispatch(createNewVaultAndRestore(pw, seed)),
  })
)(ImportSeedPhraseScreen)
