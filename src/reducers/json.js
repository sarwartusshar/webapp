import uniq from 'lodash.uniq'
import * as ACTION_TYPES from '../constants/action_types'
import * as MAPPING_TYPES from '../constants/mapping_types'
import { RELATIONSHIP_PRIORITY } from '../constants/relationship_types'

// adding methods and accessing them from this object
// allows the unit tests to stub methods in this module
const methods = {}
let hasLoadedFirstStream = false

function mergeModel(state, type, params) {
  if (params.id) {
    const newType = { ...state[type] }
    newType[params.id] = { ...newType[params.id], ...params }
    state[type] = newType
  }
}
methods.mergeModel = (state, type, params) => {
  return mergeModel(state, type, params)
}

function addModels(state, type, data) {
  // add state['modelType']
  if (!state[type]) { state[type] = {} }
  const ids = []
  if (data[type] && data[type].length) {
    // add arrays of models to state['modelType']['id']
    data[type].map((model) => {
      methods.mergeModel(state, type, model)
      ids.push(model.id)
    })
  } else if (data[type] && typeof data[type] === 'object') {
    // add single model objects to state['modelType']['id']
    const model = data[type]
    methods.mergeModel(state, type, model)
    ids.push(model.id)
  }
  return ids
}
methods.addModels = (state, type, data) => {
  return addModels(state, type, data)
}

function updateRelationship(newState, action) {
  const { userId, priority } = action.payload
  const { mappingType } = action.meta
  let followersCount = parseInt(newState[mappingType][userId].followersCount, 10)
  switch (priority) {
    case RELATIONSHIP_PRIORITY.FRIEND:
    case RELATIONSHIP_PRIORITY.NOISE:
      followersCount += 1
      break
    default:
      followersCount -= 1
      break
  }
  // TODO: update the current user's followingCount +1 (this might happen in the profile reducer)
  // TODO: if the priority changes to MUTE or BLOCK we should remove this user from the store
  methods.mergeModel(newState, mappingType, { id: userId, relationshipPriority: priority, followersCount })
  return newState
}
methods.updateRelationship = (newState, action) => {
  return updateRelationship(newState, action)
}

function updatePostLoves(state, newState, action) {
  const { method, model } = action.payload
  let delta = 0
  let loved = false
  switch (action.type) {
    case ACTION_TYPES.POST.LOVE_REQUEST:
      if (method === 'DELETE') {
        delta = -1
        loved = false
      } else {
        delta = 1
        loved = true
      }
      break
    case ACTION_TYPES.POST.LOVE_FAILURE:
      if (method === 'POST') {
        delta = -1
        loved = false
      } else {
        delta = 1
        loved = true
      }
      break
    default:
      return state
  }
  methods.mergeModel(newState, MAPPING_TYPES.POSTS, { id: model.id, lovesCount: Number(model.lovesCount) + delta, loved: loved })
  return newState
}
methods.updatePostLoves = (state, newState, action) => {
  return updatePostLoves(state, newState, action)
}

function addNewIdsToResult(state, newState, router) {
  if (!newState.pages) { newState.pages = {} }
  const result = newState.pages[router.location.pathname]
  if (!result || !result.newIds) { return state }
  result.ids = result.newIds.concat(result.ids)
  delete result.newIds
  return newState
}
methods.addNewIdsToResult = (state, newState, router) => {
  return addNewIdsToResult(state, newState, router)
}

function setLayoutMode(action, state, newState, router) {
  if (!newState.pages) { newState.pages = {} }
  const result = newState.pages[router.location.pathname]
  if (!result || (result && result.mode === action.payload.mode)) { return state }
  result.mode = action.payload.mode
  return newState
}
methods.setLayoutMode = (action, state, newState, router) => {
  return setLayoutMode(action, state, newState, router)
}

// parses the 'linked' node of the JSON
// api responses into the json store
function parseLinked(linked, newState) {
  if (!linked) { return }
  for (const linkedType in linked) {
    if ({}.hasOwnProperty.call(linked, linkedType)) {
      methods.addModels(newState, linkedType, linked)
    }
  }
}
methods.parseLinked = (linked, newState) => {
  return parseLinked(linked, newState)
}

// parse main part of request into the state and
// pull out the ids as this is the main payload
function getResult(response, newState, action) {
  const { mappingType, resultFilter } = action.meta
  const ids = methods.addModels(newState, mappingType, response)
  // set the result to the resultFilter if it exists
  const result = (typeof resultFilter === 'function') ? resultFilter(response[mappingType]) : { type: mappingType, ids: ids }
  result.pagination = action.payload.pagination
  return result
}
methods.getResult = (response, newState, action) => {
  return getResult(response, newState, action)
}

// TODO: need to test the existingResult conditional logic!!!!
function updateResult(response, newState, action, router) {
  if (!newState.pages) { newState.pages = {} }
  const result = methods.getResult(response, newState, action)
  const { resultKey } = action.meta
  // the action payload pathname comes from before the fetch so that
  // we can be sure that the result is being assigned to the proper page
  const pathname = action.payload && action.payload.pathname ? action.payload.pathname : router.location.pathname
  const resultPath = resultKey ? `${pathname}_${resultKey}` : pathname
  const existingResult = newState.pages[resultPath]
  if (existingResult && action.type === ACTION_TYPES.LOAD_NEXT_CONTENT_SUCCESS) {
    existingResult.pagination = result.pagination
    if (existingResult.next) {
      existingResult.next.ids = uniq(existingResult.next.ids.concat(result.ids))
    } else {
      existingResult.next = result
    }
  } else if (existingResult && existingResult.ids[0] !== result.ids[0]) {
    const existingIndex = result.ids.indexOf(existingResult.ids[0])
    // only do this for top level streams, nested ones like lovers/reposters
    // should just update with the new results
    if (hasLoadedFirstStream && !resultKey && existingIndex > 0 && !pathname.match(/\/(find|search)/)) {
      existingResult.newIds = result.ids.slice(0, existingIndex)
    } else {
      // this condition should only happen if there was an existingResult
      // and the new result is more than one page away from the existingResult
      // resetting the result would clear out any of the 'old' pages in next
      // this could break down if the results were random and needed a seed
      // for pagination at which point we would want to check against the seed
      // and reset the result if the previous seed didn't match the new one
      // to avoid duplicate results
      newState.pages[resultPath] = { ...existingResult, ...result }
    }
  } else if (existingResult) {
    // this keeps the pagination correct on a refresh
    // should probably be resetting the results here, but the more button breaks
    newState.pages[resultPath] = { ...result, ...existingResult }
  } else {
    newState.pages[resultPath] = result
  }
}
methods.updateResult = (response, newState, action, router) => {
  return updateResult(response, newState, action, router)
}

export default function json(state = {}, action = { type: '' }, router) {
  const newState = { ...state }
  if (action.type === ACTION_TYPES.RELATIONSHIPS.UPDATE) {
    return methods.updateRelationship(newState, action)
  } else if (action.type === ACTION_TYPES.POST.LOVE_REQUEST || action.type === ACTION_TYPES.POST.LOVE_SUCCESS || action.type === ACTION_TYPES.POST.LOVE_FAILURE) {
    return methods.updatePostLoves(state, newState, action)
  } else if (action.type === ACTION_TYPES.ADD_NEW_IDS_TO_RESULT) {
    return methods.addNewIdsToResult(state, newState, router)
  } else if (action.type === ACTION_TYPES.SET_LAYOUT_MODE) {
    return methods.setLayoutMode(action, state, newState, router)
  }
  // whitelist actions
  switch (action.type) {
    case ACTION_TYPES.LOAD_NEXT_CONTENT_SUCCESS:
    case ACTION_TYPES.LOAD_STREAM_SUCCESS:
      break
    default:
      return state
  }
  const { response } = action.payload
  if (!response) { return state }
  // parse the linked part of the response into the state
  methods.parseLinked(response.linked, newState)
  // parse main part of response into the state
  // and update the paging information
  methods.updateResult(response, newState, action, router)
  hasLoadedFirstStream = true
  return newState
}

export { json, methods }

