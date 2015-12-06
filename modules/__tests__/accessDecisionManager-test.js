import assert from 'assert'

import accessDecisionManager from '../accessDecisionManager'


describe('accessDecisionManager', () => {
  it('should always deny when not authenticated', () => {
    const authentication = {
      isAuthenticated: false,
      authorities: [ 'ROLE_USER' ],
    }
    assert(!accessDecisionManager(authentication, 'ROLE_USER'))
    assert(!accessDecisionManager(authentication, 'IS_AUTHENTICATED'))
    assert(!accessDecisionManager(authentication, ''))
  })

  it('should always grant when authenticated and no config attributes set', () => {
    const authentication = {
      isAuthenticated: true,
    }
    assert(accessDecisionManager(authentication, ''))
    assert(accessDecisionManager(authentication, []))
  })

  it('should grant IS_AUTHENTICATED when authenticated', () => {
    const authentication = {
      isAuthenticated: true,
    }
    assert(accessDecisionManager(authentication, 'IS_AUTHENTICATED'))
  })

  it('should grant fulfilled ROLE', () => {
    const authentication = {
      isAuthenticated: false,
      authorities: [ 'ROLE_USER' ],
    }
    assert(!accessDecisionManager(authentication, 'ROLE_USER'))
  })

  it('should deny unfulfilled ROLE', () => {
    const authentication = {
      isAuthenticated: false,
      authorities: [ 'ROLE_USER' ],
    }
    assert(!accessDecisionManager(authentication, 'ROLE_ADMIN'))
  })

  it('should grant when all config attributes are fulfilled', () => {
    const authentication = {
      isAuthenticated: true,
      authorities: [ 'ROLE_USER', 'ROLE_ADMIN' ],
    }
    assert(accessDecisionManager(authentication, 'ROLE_USER, ROLE_ADMIN'))
    assert(accessDecisionManager(authentication, [ 'ROLE_USER', 'ROLE_ADMIN' ]))
  })

  it('should deny when at least one config attribute is not fulfilled', () => {
    const authentication = {
      isAuthenticated: true,
      authorities: [ 'ROLE_USER' ],
    }
    assert(!accessDecisionManager(authentication, 'ROLE_USER, ROLE_ADMIN'))
    assert(!accessDecisionManager(authentication, [ 'ROLE_USER', 'ROLE_ADMIN' ]))
  })
})
