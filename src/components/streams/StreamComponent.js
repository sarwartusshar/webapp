import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import scrollTop from '../../vendor/scrollTop'
import classNames from 'classnames'
import _ from 'lodash'
import { runningFetches } from '../../middleware/requester'
import * as ACTION_TYPES from '../../constants/action_types'
import { SESSION_KEYS } from '../../constants/gui_types'
import * as MAPPING_TYPES from '../../constants/mapping_types'
import { findModel } from '../base/json_helper'
import { addScrollObject, removeScrollObject } from '../interface/ScrollComponent'
import { addResizeObject, removeResizeObject } from '../interface/ResizeComponent'
import { ElloMark } from '../interface/ElloIcons'
import { Paginator, emptyPagination } from '../streams/Paginator'
import { findLayoutMode } from '../../reducers/gui'
import { ErrorState4xx } from '../errors/Errors'
import Session from '../../vendor/session'

export class StreamComponent extends Component {

  static propTypes = {
    action: PropTypes.object,
    children: PropTypes.any,
    className: PropTypes.string,
    currentUser: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    historyLocationOverride: PropTypes.string,
    ignoresScrollPosition: PropTypes.bool.isRequired,
    initModel: PropTypes.object,
    isUserDetail: PropTypes.bool.isRequired,
    json: PropTypes.object.isRequired,
    paginatorText: PropTypes.string,
    renderObj: PropTypes.shape({
      data: PropTypes.array.isRequired,
      nestedData: PropTypes.array.isRequired,
    }).isRequired,
    result: PropTypes.shape({
      next: PropTypes.shape({
        ids: PropTypes.array,
        pagination: PropTypes.shape({
          next: PropTypes.string,
          totalCount: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
          totalPages: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
          totalPagesRemaining: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
        }),
        type: PropTypes.string,
      }),
      ids: PropTypes.array,
      pagination: PropTypes.shape({
        next: PropTypes.string,
        totalCount: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),
        totalPages: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),
        totalPagesRemaining: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),
      }),
      type: PropTypes.string,
    }),
    resultPath: PropTypes.string,
    routerState: PropTypes.object,
    scrollSessionKey: PropTypes.string,
    stream: PropTypes.object.isRequired,
  }

  static defaultProps = {
    paginatorText: 'Loading',
    ignoresScrollPosition: false,
    isUserDetail: false,
  }

  componentWillMount() {
    const { action, dispatch } = this.props
    if (action) { dispatch(action) }

    let browserListen
    if (browserHistory) {
      browserListen = browserHistory.listen
    } else {
      browserListen = (listener) => {
        listener({ key: 'testing' })
        return () => null
      }
    }
    const unlisten = browserListen(location => {
      this.state = { action, locationKey: this.generateLocationKey(location.key) }
    })
    unlisten()
    this.setDebouncedScroll = _.debounce(this.setDebouncedScroll, 300)
    this.scrollToBottom = _.debounce(this.scrollToBottom, 300)
  }

  componentDidMount() {
    const { routerState } = this.props
    if (window.embetter) {
      window.embetter.reloadPlayers()
    }
    if (this.isPageLevelComponent()) {
      addScrollObject(this)
    }
    if (this.props.isUserDetail) {
      const offset = Math.round((window.innerWidth * 0.5625)) - 200
      window.scrollTo(0, offset)
      this.saveScroll = false
    } else if (routerState.didComeFromSeeMoreCommentsLink) {
      this.saveScroll = false
    } else {
      this.saveScroll = true
    }

    addResizeObject(this)

    this.attemptToRestoreScroll()
  }

  componentWillReceiveProps(nextProps) {
    const { stream } = nextProps
    const { action } = this.state
    if (!action) { return }

    if (stream.type === ACTION_TYPES.LOAD_NEXT_CONTENT_SUCCESS) {
      this.setState({ hidePaginator: true })
    }
  }

  shouldComponentUpdate(prevProps, prevState) {
    const { stream } = this.props
    // this prevents nested stream components from clobbering parents
    if (stream.meta &&
        stream.meta.updateKey &&
        !stream.payload.endpoint.path.match(stream.meta.updateKey)) {
      return false
    // when hitting the back button the result can update and
    // try to feed wrong results to the actions render method
    // thus causing errors when trying to render wrong results
    } else if (prevProps.resultPath !== this.props.resultPath) {
      return false
    } else if (_.isEqual(prevState, this.state) &&
               _.isEqual(prevProps, this.props)) {
      return false
    }
    return true
  }

  componentDidUpdate() {
    if (window.embetter) {
      window.embetter.reloadPlayers()
    }

    const { action } = this.state
    const { stream } = this.props
    const shouldScroll = stream.type === ACTION_TYPES.LOAD_STREAM_SUCCESS &&
      action && action.payload && stream.payload.endpoint === action.payload.endpoint
    if (shouldScroll) {
      this.attemptToRestoreScroll()
    }
  }

  componentWillUnmount() {
    if (window.embetter) {
      window.embetter.stopPlayers()
    }
    removeScrollObject(this)
    removeResizeObject(this)

    this.setDebouncedScroll = () => null
    this.setScroll()
  }

  onScroll() {
    this.setDebouncedScroll()
  }

  onScrollBottom() {
    this.loadPage('next', true)
  }

  onResize(resizeProps) {
    this.setState(resizeProps)
  }

  onLoadNextPage = () => {
    this.loadPage('next')
  }

  setAction(action) {
    this.setState({ action })
    this.props.dispatch(action)
  }

  setDebouncedScroll() {
    this.setScroll()
  }

  setScroll() {
    if (!this.saveScroll) { return }

    let scrollTopValue
    if (this.scrollContainer) {
      scrollTopValue = scrollTop(this.scrollContainer)
    } else {
      scrollTopValue = scrollTop(window)
    }

    if (this.props.scrollSessionKey) {
      const sessionStorageKey = SESSION_KEYS.scrollLocationKey(this.props.scrollSessionKey)
      Session.setItem(sessionStorageKey, scrollTopValue)
    }

    this.props.dispatch({
      type: ACTION_TYPES.GUI.SET_SCROLL,
      payload: {
        key: this.state.locationKey,
        scrollTop: scrollTopValue,
      },
    })
  }

  scrollToBottom() {
    const scrollTopValue = document.body.scrollHeight
    window.scrollTo(0, scrollTopValue)
  }

  attemptToRestoreScroll() {
    const { history, routerState } = this.props
    let scrollTopValue = null
    if (!routerState.didComeFromSeeMoreCommentsLink && !this.props.ignoresScrollPosition) {
      this.saveScroll = true

      let sessionScrollLocation = null
      if (this.props.scrollSessionKey) {
        const sessionStorageKey = SESSION_KEYS.scrollLocationKey(this.props.scrollSessionKey)
        sessionScrollLocation = parseInt(Session.getItem(sessionStorageKey), 10)
      }

      if (sessionScrollLocation) {
        scrollTopValue = sessionScrollLocation
      } else if (history[this.state.locationKey]) {
        const historyObj = history[this.state.locationKey]
        scrollTopValue = historyObj.scrollTop
      }
    } else if (routerState.didComeFromSeeMoreCommentsLink) {
      this.saveScroll = true
      scrollTopValue = document.body.scrollHeight - window.innerHeight
    }
    if (scrollTopValue) {
      requestAnimationFrame(() => {
        if (this.scrollContainer) {
          this.scrollContainer.scrollTop = scrollTopValue
        } else if (typeof window !== 'undefined') {
          window.scrollTo(0, scrollTopValue)
        }
      })
    }
  }

  isPageLevelComponent() {
    return !this.props.historyLocationOverride
  }

  generateLocationKey(locationKey) {
    if (this.props.historyLocationOverride) {
      return this.props.historyLocationOverride
    }
    return locationKey
  }

  loadPage(rel, scrolled = false) {
    const { dispatch, result } = this.props
    if (!result) { return }
    const { action } = this.state
    const { meta } = action
    if (scrolled && meta && meta.resultKey && meta.updateKey) { return }
    const { pagination } = result
    if (!action.payload.endpoint ||
        !pagination[rel] ||
        parseInt(pagination.totalPagesRemaining, 10) === 0 ||
        !action) { return }
    if (runningFetches[pagination[rel]]) { return }
    this.setState({ hidePaginator: false })
    const infiniteAction = {
      ...action,
      type: ACTION_TYPES.LOAD_NEXT_CONTENT,
      payload: {
        endpoint: { path: pagination[rel] },
      },
      meta: {
        mappingType: action.payload.endpoint.pagingPath || meta.mappingType,
        resultFilter: meta.resultFilter,
        resultKey: meta.resultKey,
      },
    }
    // this is used for updating the postId on a comment
    // so that the post exsists in the store after load
    if (action.payload.postIdOrToken) {
      infiniteAction.payload.postIdOrToken = action.payload.postIdOrToken
    }
    dispatch(infiniteAction)
  }

  renderError() {
    const { action } = this.props
    const { meta } = action
    return (
      <section className="StreamComponent hasErrored">
        { meta && meta.renderStream && meta.renderStream.asError ?
          meta.renderStream.asError :
          <ErrorState4xx />
        }
      </section>
    )
  }

  renderLoading() {
    const { className } = this.props
    return (
      <section className={ classNames('StreamComponent isBusy', className)} >
        <div className="StreamBusyIndicator">
          <ElloMark />
        </div>
      </section>
    )
  }

  renderZeroState() {
    const { action } = this.props
    const { meta } = action
    return (
      <section className="StreamComponent">
        { meta && meta.renderStream && meta.renderStream.asZero ?
          meta.renderStream.asZero :
          null
        }
      </section>
    )
  }

  render() {
    const { className, currentUser, initModel, json, mode,
      paginatorText, renderObj, result, stream } = this.props
    const { action, gridColumnCount, hidePaginator } = this.state
    if (!action) { return null }
    const model = findModel(json, initModel)
    if (model && !result) {
      renderObj.data.push(model)
    } else if (!renderObj.data.length) {
      switch (stream.type) {
        case ACTION_TYPES.LOAD_STREAM_SUCCESS:
          return this.renderZeroState()
        case ACTION_TYPES.LOAD_STREAM_REQUEST:
          return this.renderLoading()
        case ACTION_TYPES.LOAD_STREAM_FAILURE:
          if (stream.error) {
            return this.renderError()
          }
          return null
        default:
          return null
      }
    }
    const { meta } = action
    const renderMethod = mode === 'grid' ? 'asGrid' : 'asList'
    const pagination = result && result.pagination ? result.pagination : emptyPagination()
    return (
      <section className={ classNames('StreamComponent', className) }>
        {
          meta.renderStream[renderMethod](
            renderObj,
            json,
            currentUser,
            gridColumnCount)
        }
        { this.props.children }
        <Paginator
          hasShowMoreButton={
            typeof meta.resultKey !== 'undefined' && typeof meta.updateKey !== 'undefined'
          }
          isHidden={ hidePaginator }
          loadNextPage={ this.onLoadNextPage }
          messageText={ paginatorText }
          totalPages={ parseInt(pagination.totalPages, 10) }
          totalPagesRemaining={ parseInt(pagination.totalPagesRemaining, 10) }
        />
      </section>
    )
  }
}

export function mapStateToProps(state, ownProps) {
  let result
  let resultPath = state.routing.location.pathname
  const { action } = ownProps
  const meta = action ? action.meta : null
  const payload = action ? action.payload : null
  const renderObj = { data: [], nestedData: [] }
  if (state.json.pages) {
    if (meta && meta.resultKey) {
      resultPath = meta.resultKey
    }
    result = state.json.pages[resultPath]
  }
  if (result && result.type === MAPPING_TYPES.NOTIFICATIONS) {
    renderObj.data = renderObj.data.concat(result.ids)
    if (result.next) {
      renderObj.data = renderObj.data.concat(result.next.ids)
    }
  } else if (meta && result && result.type === meta.mappingType ||
            (meta && meta.resultFilter && result && result.type !== meta.mappingType)) {
    const deletedCollection = state.json[`deleted_${result.type}`]
    // don't filter out blocked ids if we are in settings
    // since you can unblock/unmute them from here
    for (const id of result.ids) {
      if (_.get(state.json, [result.type, id]) &&
          (state.routing.location.pathname === '/settings' ||
          (!deletedCollection || deletedCollection.indexOf(id) === -1))) {
        renderObj.data.push(_.get(state.json, [result.type, id]))
      }
    }
    if (result.next) {
      const nextDeletedCollection = state.json[`deleted_${result.next.type}`]
      const dataProp = payload.endpoint.pagingPath ? 'nestedData' : 'data'
      for (const nextId of result.next.ids) {
        if (state.json[result.next.type][nextId] &&
            (state.routing.location.pathname === '/settings' ||
            (!nextDeletedCollection || nextDeletedCollection.indexOf(nextId) === -1))) {
          renderObj[dataProp].push(state.json[result.next.type][nextId])
        }
      }
    }
  }
  return {
    currentUser: state.profile,
    history: state.gui.history,
    json: state.json,
    mode: findLayoutMode(state.gui.modes).mode,
    renderObj,
    result,
    resultPath,
    routerState: state.routing.location.state || {},
    stream: state.stream,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(StreamComponent)

