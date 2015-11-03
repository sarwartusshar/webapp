import * as ACTION_TYPES from '../constants/action_types'
import * as MAPPING_TYPES from '../constants/mapping_types'
import * as StreamFilters from '../components/streams/StreamFilters'
import * as StreamRenderables from '../components/streams/StreamRenderables'
import * as api from '../networking/api'

export function loadDiscoverUsers(type) {
  return {
    type: ACTION_TYPES.LOAD_STREAM,
    payload: { endpoint: api.discoverUsers(type) },
    meta: { mappingType: MAPPING_TYPES.USERS, renderStream: StreamRenderables.postsAsGrid, resultFilter: StreamFilters.mostRecentPostsFromUsers },
  }
}

