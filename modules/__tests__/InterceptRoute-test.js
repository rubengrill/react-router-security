import React from 'react'
import assert from 'assert'
import { createRoutes, match, Route } from 'react-router'

import InterceptRoute from '../InterceptRoute'


describe('InterceptRoute', () => {
  it('should intercept onEnter of routes', (done) => {
    const invocations = {
      intercept: 0,
      onEnter: 0,
      onEnterLevel2: 0,
    }

    function intercept(next, nextState, replace, callback) {
      invocations.intercept++

      if (this.path === '/') {
        assert.equal(invocations.onEnter, 0)
        assert.equal(invocations.onEnterLevel2, 0)
      } else if (this.path === 'level-1') {
        assert.equal(invocations.onEnter, 1)
        assert.equal(invocations.onEnterLevel2, 0)
      } else if (this.path === 'level-2') {
        assert.equal(invocations.onEnter, 1)
        assert.equal(invocations.onEnterLevel2, 0)
      } else {
        assert.fail()
      }

      next(nextState, replace, callback)
    }

    function onEnter() {
      invocations.onEnter++

      assert.equal(this.path, '/')
    }

    function onEnterLevel2(nextState, replace, callback) {
      invocations.onEnterLevel2++

      assert.equal(this.path, 'level-2')

      callback()
    }

    const routes = createRoutes(
      React.createElement(InterceptRoute, { path: '/', component: null, onEnter, intercept },
        React.createElement(Route, { path: 'level-1', component: null },
          React.createElement(Route, { path: 'level-2', component: null, onEnter: onEnterLevel2 })
        )
      )
    )

    match({ routes, location: '/level-1/level-2' }, () => {
      assert.equal(invocations.intercept, 3)
      assert.equal(invocations.onEnter, 1)
      assert.equal(invocations.onEnterLevel2, 1)

      done()
    })
  })
})
