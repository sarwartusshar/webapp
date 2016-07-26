import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { replace } from 'react-router-redux'
import { debounce, isNil, sample, set } from 'lodash'
import { isAndroid, isElloAndroid } from '../../vendor/jello'
import { ONBOARDING_VERSION } from '../../constants/application_types'
import { FORM_CONTROL_STATUS as STATUS } from '../../constants/status_types'
import { loadProfile, requestPushSubscription, saveProfile } from '../../actions/profile'
import { signIn } from '../../actions/authentication'
import { trackEvent } from '../../actions/tracking'
import { AppleStore, GooglePlayStore } from '../../components/assets/AppStores'
import Cover from '../../components/assets/Cover'
import Credits from '../../components/assets/Credits'
import TextControl from '../../components/forms/TextControl'
import PasswordControl from '../../components/forms/PasswordControl'
import FormButton from '../../components/forms/FormButton'
import {
  isFormValid,
  getUserStateFromClient,
  getPasswordState,
} from '../../components/forms/Validators'
import { MainView } from '../../components/views/MainView'

class SignIn extends Component {

  static propTypes = {
    buildVersion: PropTypes.string,
    bundleId: PropTypes.string,
    coverDPI: PropTypes.string,
    coverOffset: PropTypes.number,
    currentStream: PropTypes.string,
    featuredUser: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    marketingVersion: PropTypes.string,
    registrationId: PropTypes.string,
    webOnboardingVersionSeen: PropTypes.string,
  }

  componentWillMount() {
    const { featuredUser } = this.props
    this.state = {
      showUserError: false,
      showPasswordError: false,
      userState: { status: STATUS.INDETERMINATE, message: '' },
      featuredUser,
      passwordState: { status: STATUS.INDETERMINATE, message: '' },
    }
    this.userValue = ''
    this.passwordValue = ''

    this.delayedShowUserError = debounce(this.delayedShowUserError, 1000)
    this.delayedShowPasswordError = debounce(this.delayedShowPasswordError, 1000)
  }

  componentWillReceiveProps(nextProps) {
    if (typeof this.props.webOnboardingVersionSeen === 'undefined' &&
        this.props.webOnboardingVersionSeen !== nextProps.webOnboardingVersionSeen) {
      const { currentStream, dispatch } = this.props
      if (nextProps.webOnboardingVersionSeen &&
          nextProps.webOnboardingVersionSeen !== ONBOARDING_VERSION) {
        dispatch(replace({ pathname: '/onboarding' }))
      } else if (!nextProps.webOnboardingVersionSeen) {
        dispatch(replace({ pathname: currentStream }))
        dispatch(saveProfile({ web_onboarding_version: ONBOARDING_VERSION }))
      } else {
        dispatch(replace({ pathname: currentStream }))
      }
    }
  }

  componentWillUnmount() {
    // Cancel lingering debounced methods
    this.delayedShowUserError.cancel()
    this.delayedShowPasswordError.cancel()
  }

  onBlurControl = () => {
    if (isAndroid()) {
      document.body.classList.remove('hideCredits')
    }
  }

  onChangeUserControl = ({ usernameOrEmail }) => {
    this.setState({ showUserError: false })
    this.delayedShowUserError()
    this.userValue = usernameOrEmail
    const { userState } = this.state
    const currentStatus = userState.status
    const newState = getUserStateFromClient({ value: usernameOrEmail, currentStatus })
    if (newState.status !== currentStatus) {
      this.setState({ userState: newState })
    }
  }

  onChangePasswordControl = ({ password }) => {
    this.setState({ showPasswordError: false })
    this.delayedShowPasswordError()
    this.passwordValue = password
    const { passwordState } = this.state
    const currentStatus = passwordState.status
    const newState = getPasswordState({ value: password, currentStatus })
    if (newState.status !== currentStatus) {
      this.setState({ passwordState: newState })
    }
  }

  onFocusControl = () => {
    if (isAndroid()) {
      document.body.classList.add('hideCredits')
    }
  }

  onSubmit = (e) => {
    e.preventDefault()

    const { dispatch, registrationId } = this.props
    const action = signIn(this.userValue, this.passwordValue)

    set(action, 'meta.successAction', () => {
      dispatch(loadProfile())
      // if we have a registrationId on login send the subscription
      // up again since this could be a new user that logged in
      if (registrationId) {
        const { buildVersion, bundleId, marketingVersion } = this.props
        dispatch(requestPushSubscription(registrationId, bundleId, marketingVersion, buildVersion))
      }
    })
    set(action, 'meta.failureAction', () => this.setState({
      failureMessage: 'Your username/email or password are incorrect',
    }))

    dispatch(action)
  }

  onClickTrackCredits = () => {
    const { dispatch } = this.props
    dispatch(trackEvent('authentication-credits-clicked'))
  }

  delayedShowUserError = () => {
    this.setState({ showUserError: true })
  }

  delayedShowPasswordError = () => {
    this.setState({ showPasswordError: true })
  }

  renderStatus(state) {
    return () => {
      if (state.status === STATUS.FAILURE) {
        return <p className="HoppyStatusMessage hasContent">{state.message}</p>
      }
      return <p className="HoppyStatusMessage"><span /></p>
    }
  }

  render() {
    const { coverDPI, coverOffset } = this.props
    const {
      userState, showUserError,
      passwordState, showPasswordError,
      failureMessage, featuredUser,
    } = this.state
    const isValid = isFormValid([userState, passwordState])
    return (
      <MainView className="Authentication">
        <div className="AuthenticationFormDialog">
          <h1>
            Welcome back.
          </h1>
          <form
            className="AuthenticationForm"
            id="NewSessionForm"
            noValidate="novalidate"
            onSubmit={this.onSubmit}
            role="form"
          >
            <TextControl
              classList="asBoxControl"
              id="usernameOrEmail"
              label="Username or Email"
              name="user[usernameOrEmail]"
              onBlur={this.onBlurControl}
              onChange={this.onChangeUserControl}
              onFocus={this.onFocusControl}
              placeholder="Enter your username or email"
              renderStatus={showUserError ? this.renderStatus(userState) : null}
              tabIndex="1"
              trimWhitespace
            />
            <PasswordControl
              classList="asBoxControl"
              label="Password"
              onBlur={this.onBlurControl}
              onChange={this.onChangePasswordControl}
              onFocus={this.onFocusControl}
              renderStatus={showPasswordError ? this.renderStatus(passwordState) : null}
              tabIndex="2"
            />
            {failureMessage ? <p>{failureMessage}</p> : null}
            <FormButton disabled={!isValid} tabIndex="3">Log in</FormButton>
          </form>
          <Link className="ForgotPasswordLink" to="/forgot-password">Forgot password?</Link>
        </div>
        <AppleStore />
        <GooglePlayStore />
        <Credits onClick={this.onClickTrackCredits} user={featuredUser} />
        {isNil(featuredUser) ? '' :
          <Cover
            coverDPI={coverDPI}
            coverImage={featuredUser.coverImage}
            coverOffset={coverOffset}
            modifiers="asFullScreen withOverlay"
          />}
      </MainView>
    )
  }
}

const mapStateToProps = (state) => {
  const obj = {
    currentStream: state.gui.currentStream,
    coverDPI: state.gui.coverDPI,
    coverOffset: state.gui.coverOffset,
    featuredUser: sample(state.promotions.authentication),
    webOnboardingVersionSeen: state.profile.webOnboardingVersion,
  }
  if (isElloAndroid()) {
    obj.buildVersion = state.profile.buildVersion
    obj.bundleId = state.profile.bundleId
    obj.marketingVersion = state.profile.marketingVersion
    obj.registrationId = state.profile.registrationId
  }
  return obj
}

export default connect(mapStateToProps)(SignIn)

