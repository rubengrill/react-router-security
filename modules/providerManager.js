export default function providerManager(authenticationProviders = {}) {
  return authentication => {
    return new Promise(resolve => {
      const authenticationProvider = authenticationProviders[authentication.type]

      if (!authenticationProvider) {
        throw new Error(`Could not authenticate authentication of type '${authentication.type}'!`)
      }

      resolve(authenticationProvider(authentication))
    })
  }
}
