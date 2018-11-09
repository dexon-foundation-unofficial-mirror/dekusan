import { connect } from 'react-redux'
import CurrencyInput from './currency-input.component'
import { DEX } from '../../constants/common'

const mapStateToProps = state => {
  const { dekusan: { nativeCurrency, currentCurrency, conversionRate } } = state

  return {
    nativeCurrency,
    currentCurrency,
    conversionRate,
  }
}

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { currentCurrency } = stateProps
  const { useFiat } = ownProps
  const suffix = useFiat ? currentCurrency.toUpperCase() : DEX

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    suffix,
  }
}

export default connect(mapStateToProps, null, mergeProps)(CurrencyInput)
