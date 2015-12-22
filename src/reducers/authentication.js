import * as ACTION_TYPES from '../constants/action_types'

const initialState = {
  isLoggedIn: false,
  accessToken: null,
  tokenType: null,
  expiresIn: null,
  createdAt: null,
}

export function authentication(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.AUTHENTICATION.LOGOUT:
      return { ...initialState }
    case ACTION_TYPES.AUTHENTICATION.USER_SUCCESS:
      return { ...state, ...action.payload.response, isLoggedIn: true }
    default:
      return state
  }
}
