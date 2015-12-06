import assert from 'assert'

import securityContext from '../securityContext'


describe('securityContext', () => {
  it('AUTHENTICATION should reset authenticationError and authenticationRequired', () => {
    let state = {
      authentication: 'old authentication',
      authenticationError: {},
      authenticationRequired: true,
    }

    state = securityContext(state, {
      type: 'AUTHENTICATION',
      payload: 'new authentication',
    })

    assert.deepEqual(state, {
      authentication: 'new authentication',
      authenticationError: null,
      authenticationRequired: false,
    })
  })

  it('AUTHENTICATION_REQUIRED should reset authentication and authenticationError', () => {
    let state = {
      authentication: 'old authentication',
      authenticationError: {},
      authenticationRequired: true,
    }

    state = securityContext(state, {
      type: 'AUTHENTICATION_REQUIRED',
      payload: {},
    })

    assert.deepEqual(state, {
      authentication: null,
      authenticationError: null,
      authenticationRequired: true,
    })
  })

  it('AUTHENTICATION failure should reset isAuthenticated', () => {
    let state = {
      authentication: {
        isAuthenticated: true,
      },
      authenticationError: null,
      authenticationRequired: false,
    }

    state = securityContext(state, {
      type: 'AUTHENTICATION',
      error: true,
      payload: 'authentication error',
    })

    assert.deepEqual(state, {
      authentication: { isAuthenticated: false },
      authenticationError: 'authentication error',
      authenticationRequired: true,
    })
  })

  it('should allow resetting authentication', () => {
    let state = {
      authentication: 'old authentication',
      authenticationError: {},
      authenticationRequired: true,
    }

    state = securityContext(state, {
      type: 'AUTHENTICATION',
      payload: null,
    })

    assert.deepEqual(state, {
      authentication: null,
      authenticationError: null,
      authenticationRequired: false,
    })
  })
})
