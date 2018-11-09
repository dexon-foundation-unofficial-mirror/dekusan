import { createSelector } from 'reselect'

export const selectedTokenAddressSelector = state => state.dekusan.selectedTokenAddress
export const tokenSelector = state => state.dekusan.tokens
export const selectedTokenSelector = createSelector(
  tokenSelector,
  selectedTokenAddressSelector,
  (tokens = [], selectedTokenAddress = '') => {
    return tokens.find(({ address }) => address === selectedTokenAddress)
  }
)
