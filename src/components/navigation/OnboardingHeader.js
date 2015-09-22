import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Link } from 'react-router'
import { ElloMark } from '../iconography/ElloIcons'
import { trackEvent } from '../../actions/tracking'

class OnboardingHeader extends React.Component {

  getButtonClassNames() {
    const { lockNext, relationshipMap } = this.props
    if (lockNext && relationshipMap) {
      return classNames(
      'Button',
      { isDisabled: relationshipMap && relationshipMap.following.length > 0 ? false : true },
      )
    }
    return 'Button'
  }


  nextWasClicked() {
    const { dispatch, batchSave, relationshipMap, trackingLabel } = this.props

    dispatch(trackEvent(`completed-${trackingLabel}`))

    // Save any relationships created...
    if (!batchSave && !relationshipMap) {
      return
    }

    const { following, inactive } = relationshipMap

    if (!following && !inactive) {
      return
    }

    const followingLength = following.length
    const inactiveLength = inactive.length

    if (followingLength) {
      const followingIds = following.map((user) => { return user.id })
      this.props.batchSave(followingIds, 'friend')
    }

    if (inactiveLength) {
      const inactiveIds = inactive.map((user) => { return user.id })
      this.props.batchSave(inactiveIds, 'inactive')
    }

    if (followingLength > 0 && inactiveLength === 0) {
      dispatch(trackEvent(`followed-all-${trackingLabel}`))
    } else if (followingLength === 0 && inactiveLength > 0) {
      dispatch(trackEvent(`unfollowed-all-${trackingLabel}`))
    } else {
      dispatch(trackEvent(`followed-some-${trackingLabel}`))
    }
  }


  skipWasClicked() {
    const { dispatch, trackingLabel } = this.props
    dispatch(trackEvent(`skipped-${trackingLabel}`))
  }


  render() {
    const { title, message, nextPath } = this.props
    return (
      <header className="OnboardingHeader">
        <div className="OnboardingColumn">
          <ElloMark />
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        <div className="OnboardingColumn">
          <Link className={this.getButtonClassNames()} to={nextPath} onClick={() => {this.nextWasClicked()}}>Next</Link>
          <p>
            <Link to={nextPath} onClick={() => {this.skipWasClicked()}}>Skip</Link>
          </p>
        </div>
      </header>
    )
  }
}

OnboardingHeader.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  trackingLabel: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  message: React.PropTypes.string.isRequired,
  nextPath: React.PropTypes.string.isRequired,
  relationshipMap: React.PropTypes.object,
  batchSave: React.PropTypes.func,
  lockNext: React.PropTypes.any,
}

export default connect()(OnboardingHeader)

