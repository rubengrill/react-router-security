import { Route } from 'react-router'

// copied from react-router (TransitionUtils)
function createEnterHook(hook, route) {
  return function enterHook(a, b, callback) {
    hook.apply(route, arguments)

    if (hook.length < 3) {
      // Assume hook executes synchronously and
      // automatically call the callback.
      callback()
    }
  }
}

function interceptRoute(route, intercept) {
  const onEnter = route.onEnter || (() => {})
  const next = createEnterHook(onEnter, route)

  route.onEnter = (nextState, replaceState, callback) => {
    intercept.call(route, next, nextState, replaceState, callback)
  }

  if (route.childRoutes) {
    route.childRoutes.forEach((childRoute) => {
      interceptRoute(childRoute, intercept)
    })
  }
}

function createRouteFromReactElement(element) {
  const route = Route.createRouteFromReactElement(element)

  if (route.intercept) {
    interceptRoute(route, route.intercept)
  }

  return route
}

class InterceptRoute extends Route {
}

InterceptRoute.createRouteFromReactElement = createRouteFromReactElement

export default InterceptRoute
