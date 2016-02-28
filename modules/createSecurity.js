import _accessDecisionManager from './accessDecisionManager'
import createAuthentication from './createAuthentication'
import logoutFilter from './logoutFilter'
import providerManager from './providerManager'


const _securityContextSelector = state => state.securityContext

export default function createSecurity({
  store,
  securityContextSelector = _securityContextSelector,
  accessDecisionManager = _accessDecisionManager,
  accessDeniedPathname = '/access-denied',
  accessProperty = 'access',
  authenticationManager = providerManager(),
  loginPathname = '/login',
  logoutHandler = logoutFilter(),
  logoutPathname = '/logout',
  logoutSuccessPathname = null,
  nextPathnameProperty = 'nextPathname',
}) {
  if (!store) {
    throw new Error(
      'You must provide a store to createSecurity. ' +
      'Did you forget to pass the store within an object to createSecurity? ' +
      '--> createSecurity({store})'
    )
  }

  function getSecurityContext() {
    return securityContextSelector(store.getState())
  }

  function nextPathname(location, defaultPathname = '/') {
    return location && location.state && location.state[nextPathnameProperty] || defaultPathname
  }

  function authenticate(authentication) {
    authentication = createAuthentication(authentication)

    store.dispatch({
      type: 'AUTHENTICATION',
      payload: authentication,
    })

    return authentication
  }

  function authenticationFailed(error) {
    store.dispatch({
      type: 'AUTHENTICATION',
      error: true,
      payload: error,
    })

    return error
  }

  function requireAuthentication() {
    store.dispatch({
      type: 'AUTHENTICATION_REQUIRED',
      payload: {},
    })
  }

  function login(authentication) {
    return new Promise(resolve => {
      authentication = authenticate(authentication)

      if (!authentication.isAuthenticated) {
        resolve(authenticationManager(authentication).then(
          _authentication => {
            if (!_authentication.isAuthenticated) {
              throw new Error(
                `authenticationManager returned an unauthenticated authentication ` +
                `(type '${authentication.type}')`
              )
            }

            _authentication = authenticate(_authentication)
            return _authentication
          },
          error => {
            authenticationFailed(error)
            return authentication
          }
        ))
        return
      }

      resolve(authentication)
    })
  }

  function logout() {
    return new Promise(resolve => {
      const securityContext = getSecurityContext()
      const authentication = securityContext && securityContext.authentication

      if (authentication) {
        if (authentication.isAuthenticated || authentication.forceLogout) {
          resolve(logoutHandler(authentication).then(() => {
            authenticate(null)
          }))
          return
        }
        authenticate(null)
      }

      resolve()
    })
  }

  function secureRoutes(next, nextState, replace, callback) {
    const { routes } = nextState

    // We check access for the most specific route that has the access property set.
    // It is not sufficient to do that check only when secureRoutes is called for that route,
    // to prevent that onEnter is called for previous routes when access is denied finally.
    // We also can't simply check access when secureRoutes is called for the first route,
    // as it is not sure that secureRoutes is called by the router for that route.
    // This is the case if you have a transition like `/news` > `/dashboard`,
    // then onEnter for `/` is called only for `/news` (if `/` is the parent route).
    // There is no clean way to pass state between calls of secureRoutes explicitly,
    // to tell that access is already checked.
    // However, we pass that state implicitly via securityContext.
    // So it is ensured that authenticationManager is called only once per transition.
    // The accessDecisionManager is still called for every route, but this is acceptable,
    // as calls to accessDecisionManager should be fast and 'stateless'.

    let checkRoute

    for (let i = routes.length - 1; i >= 0; i--) {
      if (routes[i][accessProperty]) {
        checkRoute = routes[i]
        break
      }
    }

    if (checkRoute) {
      const { access } = checkRoute

      const authenticationPromise = new Promise((resolve, reject) => {
        const securityContext = getSecurityContext()

        if (!securityContext) {
          throw new Error(
            'No securityContext found. ' +
            'Did you forget to include securityContext in your store?'
          )
        }

        if (nextState.location.pathname === loginPathname) {
          throw new Error(
            `Access to the login route '${loginPathname}' must not be restricted.`
          )
        }

        if (nextState.location.pathname === logoutPathname) {
          throw new Error(
            `Access to the logout route '${logoutPathname}' must not be restricted.`
          )
        }

        const { authentication } = securityContext

        if (!authentication) {
          requireAuthentication()
          reject()
          return
        }

        if (authentication && !authentication.isAuthenticated) {
          resolve(authenticationManager(authentication).then(
            _authentication => {
              if (!_authentication.isAuthenticated) {
                throw new Error(
                  `authenticationManager returned an unauthenticated authentication ` +
                  `(type '${authentication.type}')`
                )
              }

              return authenticate(_authentication)
            },
            error => {
              authenticationFailed(error)
              return Promise.reject()
            }
          ))
          return
        }

        // authentication && authentication.isAuthenticated
        resolve(authentication)
      })

      authenticationPromise.then(
        authentication => {
          if (!accessDecisionManager(authentication, access)) {
            replace(accessDeniedPathname)
            callback()
            return
          }
          next(nextState, replace, callback)
        },
        error => {
          if (error) {
            callback(error)
            return
          }

          replace({
            pathname: loginPathname,
            state: { [nextPathnameProperty]: nextState.location.pathname },
          })
          callback()
        }
      )

      return
    }

    if (nextState.location.pathname === logoutPathname && this === nextState.routes[nextState.routes.length - 1]) {
      let _replaceCalled = false
      const _replace = location => {
        _replaceCalled = true
        replace(location)
      }

      next(nextState, _replace, onEnterError => {
        logout()
          .then(() => {
            if (onEnterError) {
              throw onEnterError
            }
            if (logoutSuccessPathname && !_replaceCalled) {
              replace(logoutSuccessPathname)
            }
            callback()
          })
          .catch(logoutError => {
            callback({ logoutError, onEnterError })
          })
      })
      return
    }

    next(nextState, replace, callback)
  }

  return {
    accessDeniedPathname,
    authenticate,
    authenticationFailed,
    getSecurityContext,
    requireAuthentication,
    login,
    loginPathname,
    logout,
    logoutPathname,
    nextPathname,
    secureRoutes,
  }
}
