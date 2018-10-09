import * as React from 'react'

type Props = {
  name: string,
  footer?: JSX.Element,
  children?: any
}

export default function Section(props: Props) {
  return (
    <div className="card panel-default">
      <div className="card-header">
        <h1 className="card-title">{props.name}</h1>
      </div>
      <div className="card-body">
        { props.children }
      </div>
      { props.footer ? <div className="card-footer">{props.footer}</div> : <div /> }
    </div>
  )
}
