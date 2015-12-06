import assert from 'assert'

import logoutFilter from '../logoutFilter'


describe('logoutFilter', () => {
  it('should try all logoutHandlers', done => {
    let checksum = 0

    const logoutHandler = logoutFilter([
      () => { checksum += 1; return Promise.reject('foobar') },
      () => { checksum += 2; return Promise.resolve() },
    ])

    logoutHandler({}).then(() => {
      assert.equal(checksum, 3)

      done()
    })
  })

  it('should collect errors', done => {
    const logoutHandler = logoutFilter([
      () => { throw new Error('foo') },
      () => { return Promise.reject({ message: 'bar' }) },
    ])

    logoutHandler({ type: 'form' }).catch(error => {
      assert.equal(error.length, 3)
      assert.equal(error[0].message, 'foo')
      assert.equal(error[1].message, 'bar')
      assert.equal(error[2].message, `Could not logout authentication (type 'form')`)

      done()
    })
  })

  it('should stop as soon as a logutHandler was successfull', done => {
    let checksum = 0

    const logoutHandler = logoutFilter([
      () => { checksum += 1; return Promise.resolve('foobar') },
      () => { checksum += 2; return Promise.reject() },
    ])

    logoutHandler({}).then(() => {
      assert.equal(checksum, 1)

      done()
    })
  })

  it('should allow passing zero functions', done => {
    const logoutHandler = logoutFilter()

    logoutHandler({ type: 'form' }).catch(error => {
      assert.equal(error.message, `Could not logout authentication (type 'form')`)

      done()
    })
  })

  it('should allow passing a single function', done => {
    let checksum = 0

    const logoutHandler = logoutFilter(
      () => { checksum += 1; return Promise.resolve() },
    )

    logoutHandler({}).then(() => {
      assert.equal(checksum, 1)

      done()
    })
  })
})
