import * as React from 'react'

const LoadTemplate = () => {
  const idList = [
    'LockWithPublicKey',
    'LockWithPublicKeyHash',
    'LockWithMultiSig',
    'TradeOffer',
    'Escrow',
    'LoanCollateral',
    'CallOption',
    'RevealPreimage'
  ]
  const options = idList.slice(1).map(id => {
    return <li key={id}><a href='#'>{id}</a></li>
  })
  return (
    <div className="dropdown">
      <button className="btn btn-primary dropdown-toggle"
              type="button" id="dropdownMenu1"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
        <span className="glyphicon glyphicon-open"></span>
        Load
      </button>
      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
        {options}
      </ul>
    </div>
  )
}

export default LoadTemplate
