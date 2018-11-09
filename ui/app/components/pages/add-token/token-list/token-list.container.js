import { connect } from 'react-redux'
import TokenList from './token-list.component'

const mapStateToProps = ({ dekusan }) => {
  const { tokens } = dekusan
  return {
    tokens,
  }
}

export default connect(mapStateToProps)(TokenList)
