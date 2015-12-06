import React from 'react'


export default React.createClass({

  getInitialState() {
    return { error: null }
  },

  onSubmit(e) {
    e.preventDefault()

    this.setState({ error: null })

    this.props.security.login({
      type: 'form',
      principal: this.refs.username.value,
      password: this.refs.password.value,
    }).then(() => {
      const securityContext = this.props.security.getSecurityContext()
      const nextPathname = this.props.security.nextPathname(this.props.location)

      if (securityContext.authenticationError) {
        this.setState({ error: 'Login failed' })
      } else {
        this.props.history.pushState({}, nextPathname)
      }
    })
  },

  render() {
    return (
      <div>
        <h1>Login</h1>
        <p>Login with foo / bar</p>
        <form onSubmit={this.onSubmit}>
          <input ref="username" placeholder="Username" autoFocus /><br />
          <input ref="password" placeholder="Password" type="password" /><br />
          <button>Login</button>
        </form>
        {this.state.error && (
          <p>{this.state.error}</p>
        )}
      </div>
    )
  },

})
