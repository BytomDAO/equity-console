// external imports
import * as React from 'react'
import { connect } from 'react-redux'

import { getWidget } from '../../contracts/components/parameters'

const UnlockValue = () => {
    return (
      <div>
        {getWidget("unlockValue.passwordInput")}
        {getWidget("unlockValue.gasInput")}
      </div>
    )
}

export default UnlockValue
