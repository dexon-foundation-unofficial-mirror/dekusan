import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { default as MaterialTextField } from '@material-ui/core/TextField'

const inputLabelBase = {
  transform: 'none',
  transition: 'none',
  position: 'initial',
  color: '#000',
  fontFamily: 'Overpass',
}

const styles = {
  typography: {
    fontFamily: 'Overpass',
  },
  materialLabel: {
    '&$materialFocused': {
      color: '#000',
    },
    '&$materialError': {
      color: '#000',
    },
    fontWeight: '400',
    fontFamily: 'Overpass',
    color: '#000',
  },
  materialFocused: {},
  materialUnderline: {
    '&:before': {
      borderBottom: '2px solid #000',
    },
    '&:hover:before': {
      borderBottom: '2px solid #000000cc!important',
    },
    '&:after': {
      borderBottom: '2px solid #000',
    },
  },
  materialError: {},
  materialInput: {
    color: 'white',
  },
  // Non-material styles
  formLabel: {
    '&$formLabelFocused': {
      color: '#000',
    },
    '&$materialError': {
      color: '#000',
    },
    fontFamily: 'Overpass',
  },
  formLabelFocused: {},
  inputFocused: {},
  inputRoot: {
    'label + &': {
      marginTop: '8px',
    },
    border: 'none',
    height: '48px',
    fontFamily: 'Overpass',
    background: '#f0f0f0',
    borderRadius: '4px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    '&$inputFocused': {
      border: 'none',
    },
  },
  input: {
    color: 'black',
    fontFamily: 'Overpass',
  },
  largeInputLabel: {
    ...inputLabelBase,
    fontSize: '1rem',
  },
  inputLabel: {
    ...inputLabelBase,
    fontSize: '.75rem',
  },
}

const TextField = props => {
  const { error, classes, material, startAdornment, largeLabel, ...textFieldProps } = props

  return (
    <MaterialTextField
      error={Boolean(error)}
      helperText={error}
      InputLabelProps={{
        shrink: material ? undefined : true,
        className: material ? '' : (largeLabel ? classes.largeInputLabel : classes.inputLabel),
        FormLabelClasses: {
          root: material ? classes.materialLabel : classes.formLabel,
          focused: material ? classes.materialFocused : classes.formLabelFocused,
          error: classes.materialError,
        },
      }}
      InputProps={{
        startAdornment: startAdornment || undefined,
        disableUnderline: !material,
        classes: {
          root: material ? '' : classes.inputRoot,
          input: material ? classes.materialInput : classes.input,
          underline: material ? classes.materialUnderline : '',
          focused: material ? '' : classes.inputFocused,
        },
      }}
      {...textFieldProps}
    />
  )
}

TextField.defaultProps = {
  error: null,
}

TextField.propTypes = {
  error: PropTypes.string,
  classes: PropTypes.object,
  material: PropTypes.bool,
  startAdornment: PropTypes.element,
  largeLabel: PropTypes.bool,
}

export default withStyles(styles)(TextField)
