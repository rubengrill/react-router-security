import React from 'react'
import { IndexLink, Link } from 'react-router'


const ACTIVE = { color: 'red' }

export default React.createClass({

  render() {
    return (
      <div>
        <h1>App</h1>
        <ul>
          <li><IndexLink to="/" activeStyle={ACTIVE}>/</IndexLink></li>
          <li><Link to="/dashboard" activeStyle={ACTIVE}>/dashboard</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
        {this.props.children}
      </div>
    )
  },

})
