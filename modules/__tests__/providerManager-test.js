import assert from 'assert'

import providerManager from '../providerManager'


describe('providerManager', () => {
  it('should call matching authentication provider', (done) => {
    const authenticationBefore = {
      type: 'form',
      isAuthenticated: false,
      principal: 'Test User',
      credentials: 'Password',
    }
    const authenticationAfter = {
      type: 'form',
      isAuthenticated: true,
      principal: 'Test User',
    }
    const formAuthenticationProvider = () => {
      return Promise.resolve(authenticationAfter)
    }
    const authenticationManager = providerManager({
      form: formAuthenticationProvider,
    })

    authenticationManager(authenticationBefore).then(authentication => {
      assert.deepEqual(authentication, authenticationAfter)

      done()
    })
  })

  it('should raise error when no matching authentication provider', (done) => {
    const authenticationBefore = {
      type: 'token',
      isAuthenticated: false,
      credentials: '1234567890',
    }
    const formAuthenticationProvider = () => {
      assert.fail('I should not be called')
    }
    const authenticationManager = providerManager({
      form: formAuthenticationProvider,
    })

    authenticationManager(authenticationBefore).catch(error => {
      assert(error)

      done()
    })
  })
})
