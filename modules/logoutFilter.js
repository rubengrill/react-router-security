export default function logoutFilter(logoutHandlers = []) {
  if (!Array.isArray(logoutHandlers)) {
    logoutHandlers = [ logoutHandlers ]
  }

  return authentication => {
    const errors = []
    const handlers = [ ...logoutHandlers ]

    function next() {
      return (
        new Promise(resolve => {
          const handler = handlers.shift()

          if (!handler) {
            errors.push(new Error(`Could not logout authentication (type '${authentication.type}')`))
            resolve()
            return
          }

          resolve(handler(authentication))
        })
        .catch(error => {
          errors.push(error)
          return next()
        })
      )
    }

    return next().then(() => {
      if (errors.length && errors.length >= logoutHandlers.length) {
        return Promise.reject(errors.length === 1 ? errors[0] : errors)
      }
    })
  }
}
