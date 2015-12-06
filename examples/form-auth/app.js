import 'babel/polyfill'

import React from 'react' // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom'
import Router, { Route } from 'react-router'
import { createHistory, useBasename } from 'history'
import { createSecurity, securityContext, providerManager, InterceptRoute } from 'react-router-security'
import { createStore, combineReducers } from 'redux'

import App from '../base/App'
import Dashboard from '../base/Dashboard'
import Login from '../base/Login'
import fetch from '../base/fetch'


const history = useBasename(createHistory)({
  basename: '/form-auth',
})

const formAuthenticationProvider = authentication => {
  const username = authentication.principal
  const password = authentication.password
  const options = {
    credentials: 'include',
    method: 'post',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' },
  }

  return fetch('/auth/login', options)
    .then(res => res.json())
    .then(user => ({
      type: 'form',
      isAuthenticated: true,
      principal: user.username,
      authorities: user.roles,
    }))
}

const sessionAuthenticationProvider = () => {
  return fetch('/auth/user', { credentials: 'include' })
    .then(res => res.json())
    .then(user => ({
      type: 'session',
      isAuthenticated: true,
      principal: user.username,
      authorities: user.roles,
    }))
}

const authenticationManager = providerManager({
  form: formAuthenticationProvider,
  session: sessionAuthenticationProvider,
})

const logoutHandler = () => {
  return fetch('/auth/logout', { credentials: 'include' })
}

const reducer = combineReducers({ securityContext })
const store = createStore(reducer)
const security = createSecurity({
  authenticationManager,
  logoutHandler,
  logoutSuccessPathname: '/login',
  store,
})

const createElement = (Component, props) => <Component {...props} security={security} />

// assume we are already logged in
security.authenticate({ type: 'session' })

ReactDOM.render((
  <Router history={history} createElement={createElement}>
    <InterceptRoute intercept={security.secureRoutes}>
      <Route path="/" component={App} access="ROLE_USER">
        <Route path="dashboard" component={Dashboard} />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/logout" />
    </InterceptRoute>
  </Router>
), document.getElementById('example'))

window.store = store // for debugging
