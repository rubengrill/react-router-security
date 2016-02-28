import React from 'react'
import assert from 'assert'
import { createRoutes, match, Route } from 'react-router'
import { createStore, combineReducers } from 'redux'

import InterceptRoute from '../InterceptRoute'
import createAuthentication from '../createAuthentication'
import createSecurity from '../createSecurity'
import securityContext from '../securityContext'


describe('createSecurity', () => {
  it('should redirect to loginPathname when accessing restricted route without authentication', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert.equal(redirectLocation.pathname, '/login')
      assert.equal(redirectLocation.state.nextPathname, '/')
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: true,
      })

      done()
    })
  })

  it('should render when accessing restricted route with authenticated authentication and fulfilled roles', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })

    security.authenticate(authentication)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert(!redirectLocation)
      assert(renderProps)

      assert.deepEqual(ctx, {
        authentication,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should redirect to accessDeniedPathname when accessing restricted route with authenticated authentication and unfulfilled roles', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_ADMIN' })
    )
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })

    security.authenticate(authentication)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert.equal(redirectLocation.pathname, '/access-denied')
      assert(redirectLocation.state === null)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should render when accessing restricted route with unauthenticated authentication and fulfilled roles', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )

    security.authenticate(authenticationBefore)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert(!redirectLocation)
      assert(renderProps)

      assert.deepEqual(ctx, {
        authentication: authenticationAfter,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should redirect to accessDeniedPathname when accessing restricted route with unauthenticated authentication and unfulfilled roles', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_ADMIN' })
    )

    security.authenticate(authenticationBefore)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert.equal(redirectLocation.pathname, '/access-denied')
      assert(redirectLocation.state === null)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: authenticationAfter,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should redirect to login when accessing restricted route with unauthenticated authentication and authentication error', done => {
    const authenticationError = {
      statusCode: 400,
    }
    const authenticationManager = () => {
      return Promise.reject(authenticationError)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_ADMIN' })
    )
    const authentication = createAuthentication({
      isAuthenticated: false,
    })

    security.authenticate(authentication)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert.equal(redirectLocation.pathname, '/login')
      assert.equal(redirectLocation.state.nextPathname, '/')
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication,
        authenticationError,
        authenticationRequired: true,
      })

      done()
    })
  })

  it('should raise an error when authenticationManager returns an unauthenticated authentication (routing)', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: false,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )

    security.authenticate(authenticationBefore)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(error)
      assert(!redirectLocation)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should raise an error when authenticationManager throws an exception (routing)', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationManager = () => {
      throw new Error('foo')
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )

    security.authenticate(authenticationBefore)

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(error)
      assert(!redirectLocation)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should raise an error when no securityContext is provided', done => {
    const store = createStore((state = {}) => state)
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' })
    )

    match({ routes, location: '/' }, (error, redirectLocation, renderProps) => {
      assert(error)
      assert(!redirectLocation)
      assert(!renderProps)

      done()
    })
  })

  it('should provide securityContext', () => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const authentication = security.authenticate({
      type: 'token',
      credentials: '1234567890',
    })
    const authenticationError = security.authenticationFailed({
      statusCode: 400,
    })

    assert.deepEqual(security.getSecurityContext(), {
      authentication,
      authenticationError,
      authenticationRequired: true,
    })
  })

  it('login with unauthenticated authentication', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })

    security.login(authenticationBefore).then(authentication => {
      const ctx = store.getState().securityContext

      assert.deepEqual(authentication, authenticationAfter)

      assert.deepEqual(ctx, {
        authentication: authenticationAfter,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('login with authenticated authentication', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      assert.fail('I should not be called')
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })

    security.login(authenticationBefore).then(authentication => {
      const ctx = store.getState().securityContext

      assert.deepEqual(authentication, authenticationBefore)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('login with authentication failure', done => {
    const authenticationError = {
      statusCode: 400,
    }
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationManager = () => {
      return Promise.reject(authenticationError)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })

    security.login(authenticationBefore).then(authentication => {
      const ctx = store.getState().securityContext

      assert.deepEqual(authentication, authenticationBefore)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError,
        authenticationRequired: true,
      })

      done()
    })
  })

  it('should raise an error when authenticationManager returns an unauthenticated authentication (login)', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: false,
      authorities: [ 'ROLE_USER' ],
    })
    const authenticationManager = () => {
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })

    security.login(authenticationBefore).catch(error => {
      const ctx = store.getState().securityContext

      assert(error)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should raise an error when authenticationManager throws an exception (login)', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationManager = () => {
      throw new Error('foo')
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })

    security.login(authenticationBefore).catch(error => {
      const ctx = store.getState().securityContext

      assert(error)

      assert.deepEqual(ctx, {
        authentication: authenticationBefore,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('logout with unauthenticated authentication', done => {
    const authentication = createAuthentication({
      isAuthenticated: false,
    })
    const logoutHandler = () => {
      assert.fail()
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutHandler })

    security.authenticate(authentication)

    security.logout().then(() => {
      const ctx = store.getState().securityContext

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('logout with authenticated authentication', done => {
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    let logoutHandlerCalled = false
    const logoutHandler = () => {
      logoutHandlerCalled = true
      return Promise.resolve()
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutHandler })

    security.authenticate(authentication)

    security.logout().then(() => {
      const ctx = store.getState().securityContext

      assert(logoutHandlerCalled)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('logout with unauthenticated authentication and forceLogout', done => {
    const authentication = createAuthentication({
      type: 'session',
      isAuthenticated: false,
      forceLogout: true,
    })
    let logoutHandlerCalled = false
    const logoutHandler = () => {
      logoutHandlerCalled = true
      return Promise.resolve()
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutHandler })

    security.authenticate(authentication)

    security.logout().then(() => {
      const ctx = store.getState().securityContext

      assert(logoutHandlerCalled)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('logout with logoutHandler failure', done => {
    const logoutHandlerFailure = {
      statusCode: 400,
    }
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const logoutHandler = () => {
      return Promise.reject(logoutHandlerFailure)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutHandler })

    security.authenticate(authentication)

    security.logout().catch(error => {
      const ctx = store.getState().securityContext

      assert(error)
      assert.deepEqual(error, logoutHandlerFailure)

      assert.deepEqual(ctx, {
        authentication,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('logout with logoutHandler exception', done => {
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    const logoutHandler = () => {
      throw new Error('foo')
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutHandler })

    security.authenticate(authentication)

    security.logout().catch(error => {
      const ctx = store.getState().securityContext

      assert(error)
      assert(error.message, 'foo')

      assert.deepEqual(ctx, {
        authentication,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should not call any onEnter on denied routes', done => {
    const dontCallMe = () => { assert.fail() }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, onEnter: dontCallMe },
        React.createElement(Route, { path: 'dashboard', component: null, onEnter: dontCallMe },
          React.createElement(Route, { path: 'secret', component: null, onEnter: dontCallMe, access: 'ROLE_USER' })
        )
      )
    )

    match({ routes, location: '/dashboard/secret' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(!error)
      assert.equal(redirectLocation.pathname, '/login')
      assert.equal(redirectLocation.state.nextPathname, '/dashboard/secret')
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: true,
      })

      done()
    })
  })

  it('should call authenticationManager only once per route transition', done => {
    const authenticationBefore = createAuthentication({
      isAuthenticated: false,
    })
    const authenticationAfter = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    let authenticationManagerCalls = 0
    const authenticationManager = () => {
      authenticationManagerCalls++
      return Promise.resolve(authenticationAfter)
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, authenticationManager })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes },
        React.createElement(Route, { path: 'dashboard', component: null },
          React.createElement(Route, { path: 'secret', component: null, access: 'ROLE_USER' })
        )
      )
    )

    security.authenticate(authenticationBefore)

    match({ routes, location: '/dashboard/secret' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert.equal(authenticationManagerCalls, 1)

      assert(!error)
      assert(!redirectLocation)
      assert(renderProps)

      assert.deepEqual(ctx, {
        authentication: authenticationAfter,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should not allow restricting login route', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' },
        React.createElement(Route, { path: 'login', component: null })
      )
    )

    match({ routes, location: '/login' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(error)
      assert(!redirectLocation)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should not allow restricting logout route', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes, access: 'ROLE_USER' },
        React.createElement(Route, { path: 'logout', component: null })
      )
    )

    match({ routes, location: '/logout' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(error)
      assert(!redirectLocation)
      assert(!renderProps)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should logout when logout route is requested', done => {
    const authentication = createAuthentication({
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    })
    let logoutHandlerCalled = false
    const logoutHandler = () => {
      logoutHandlerCalled = true
      return Promise.resolve()
    }
    const store = createStore(combineReducers({ securityContext }))
    let onEnterCalled = false
    const onEnter = () => {
      const ctx = store.getState().securityContext
      onEnterCalled = true
      assert.deepEqual(ctx.authentication, authentication, 'I should still be able to access authentication')
    }
    const security = createSecurity({ store, logoutHandler })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/logout', component: null, intercept: security.secureRoutes, onEnter })
    )

    security.authenticate(authentication)

    match({ routes, location: '/logout' }, (error, redirectLocation, renderProps) => {
      const ctx = store.getState().securityContext

      assert(logoutHandlerCalled)
      assert(onEnterCalled)

      assert(!error)
      assert(!redirectLocation)
      assert(renderProps)

      assert.deepEqual(ctx, {
        authentication: null,
        authenticationError: null,
        authenticationRequired: false,
      })

      done()
    })
  })

  it('should redirect to logoutSuccessPathname when logout route is accessed', done => {
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutSuccessPathname: '/' })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes },
        React.createElement(Route, { path: 'logout', component: null })
      )
    )

    match({ routes, location: '/logout' }, (error, redirectLocation, renderProps) => {
      assert(!error)
      assert.equal(redirectLocation.pathname, '/')
      assert(!renderProps)

      done()
    })
  })

  it('should not redirect to logoutSuccessPathname when logout route is accessed and onEnter redirects to another route', done => {
    const onEnter = (nextState, replace) => {
      replace('/foobar')
    }
    const store = createStore(combineReducers({ securityContext }))
    const security = createSecurity({ store, logoutSuccessPathname: '/' })
    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, intercept: security.secureRoutes },
        React.createElement(Route, { path: 'logout', component: null, onEnter })
      )
    )

    match({ routes, location: '/logout' }, (error, redirectLocation, renderProps) => {
      assert(!error)
      assert.equal(redirectLocation.pathname, '/foobar')
      assert(!renderProps)

      done()
    })
  })
})
