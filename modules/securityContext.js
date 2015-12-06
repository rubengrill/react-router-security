const initialState = {
  authentication: null,
  authenticationError: null,
  authenticationRequired: false,
}

export default function securityContext(state = initialState, action) {
  switch (action.type) {
    case 'AUTHENTICATION':
      if (action.error) {
        return {
          authentication: Object.assign({}, state.authentication, { isAuthenticated: false }),
          authenticationError: action.payload || true,
          authenticationRequired: true,
        }
      }
      return {
        authentication: action.payload,
        authenticationError: null,
        authenticationRequired: false,
      }

    case 'AUTHENTICATION_REQUIRED':
      return {
        authentication: null,
        authenticationError: null,
        authenticationRequired: true,
      }

    default:
      return state
  }
}
