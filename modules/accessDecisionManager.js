export default function accessDecisionManager(authentication, configAttributes) {
  if (!authentication.isAuthenticated) {
    return false
  }
  if (!configAttributes) {
    return true
  }
  if (typeof configAttributes === 'string') {
    configAttributes = configAttributes.split(',')
  }

  return configAttributes.every(configAttribute => {
    configAttribute = configAttribute.trim()

    if (!configAttribute) {
      return true
    }

    if (configAttribute === 'IS_AUTHENTICATED') {
      return true
    } else if (configAttribute.indexOf('ROLE_') === 0) {
      return (authentication.authorities || []).indexOf(configAttribute) !== -1
    }
    return false
  })
}
