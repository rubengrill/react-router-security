export default function createAuthentication(authentication) {
  if (!authentication) {
    return null
  }

  return {
    ...authentication,
    ...{
      type: authentication.type || null,
      name: authentication.name || (authentication.principal ? '' + authentication.principal : ''),
      authorities: authentication.authorities || [],
      credentials: authentication.credentials || null,
      details: authentication.details || null,
      principal: authentication.principal || null,
      isAuthenticated: !!authentication.isAuthenticated,
      forceLogout: !!authentication.forceLogout,
    },
  }
}
