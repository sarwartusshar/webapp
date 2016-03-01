import { UPDATE_LOCATION } from 'react-router-redux'
import {
  BEACONS,
  HEAD_FAILURE,
  HEAD_REQUEST,
  HEAD_SUCCESS,
  LOAD_STREAM_SUCCESS,
  PROFILE,
  SET_LAYOUT_MODE,
} from '../constants/action_types'


let location = {}
// order matters for matching routes
const initialState = {
  modes: [
    { label: 'discover', mode: 'grid', regex: /\/discover|\/explore/ },
    { label: 'following', mode: 'grid', regex: /\/following/ },
    { label: 'invitations', mode: 'list', regex: /\/invitations/ },
    { label: 'onboarding', mode: 'grid', regex: /\/onboarding/ },
    { label: 'search', mode: 'grid', regex: /\/search|\/find/ },
    { label: 'starred', mode: 'list', regex: /\/starred/ },
    { label: 'posts', mode: 'list', regex: /\/[\w\-]+\/post\/.+/ },
    { label: 'users/following', mode: 'grid', regex: /\/[\w\-]+\/following/ },
    { label: 'users/followers', mode: 'grid', regex: /\/[\w\-]+\/followers/ },
    { label: 'users/loves', mode: 'grid', regex: /\/[\w\-]+\/loves/ },
    { label: 'users', mode: 'list', regex: /\/[\w\-]+/ },
  ],
  newNotificationContent: false,
}

// TODO: figure out why the users regex doesn't work properly
export function findLayoutMode(modes) {
  for (const mode of modes) {
    const regEx = new RegExp(mode.regex)
    if (regEx.test(location.pathname)) {
      return mode
    }
  }
  return modes[modes.length - 1]
}

export function gui(state = initialState, action = { type: '' }) {
  const newState = { ...state }
  let mode = null
  switch (action.type) {
    case BEACONS.LAST_DISCOVER_VERSION:
      return { ...state, lastDiscoverBeaconVersion: action.payload.version }
    case BEACONS.LAST_FOLLOWING_VERSION:
      return { ...state, lastFollowingBeaconVersion: action.payload.version }
    case BEACONS.LAST_STARRED_VERSION:
      return { ...state, lastStarredBeaconVersion: action.payload.version }
    case HEAD_FAILURE:
      return { ...state, newNotificationContent: false }
    case HEAD_REQUEST:
      return { ...state, lastNotificationCheck: new Date() }
    case HEAD_SUCCESS:
      if (action.payload.serverResponse.status === 204) {
        return { ...state, newNotificationContent: true }
      }
      return state
    case LOAD_STREAM_SUCCESS:
      if (action.meta && /\/notifications/.test(action.meta.resultKey)) {
        return { ...state, newNotificationContent: false }
      }
      return state
    case PROFILE.DELETE_SUCCESS:
      return { ...initialState }
    case SET_LAYOUT_MODE:
      mode = findLayoutMode(newState.modes)
      if (mode.mode === action.payload.mode) return state
      mode.mode = action.payload.mode
      return newState
    case UPDATE_LOCATION:
      location = action.payload
      return state
    default:
      return state
  }
}
