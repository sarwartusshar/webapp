// TODO: move all of these into a STREAM object
export const ADD_NEW_IDS_TO_RESULT = 'ADD_NEW_IDS_TO_RESULT'

export const LOAD_STREAM = 'LOAD_STREAM'
export const LOAD_STREAM_REQUEST = 'LOAD_STREAM_REQUEST'
export const LOAD_STREAM_SUCCESS = 'LOAD_STREAM_SUCCESS'
export const LOAD_STREAM_FAILURE = 'LOAD_STREAM_FAILURE'

export const LOAD_NEXT_CONTENT = 'LOAD_NEXT_CONTENT'
export const LOAD_NEXT_CONTENT_REQUEST = 'LOAD_NEXT_CONTENT_REQUEST'
export const LOAD_NEXT_CONTENT_SUCCESS = 'LOAD_NEXT_CONTENT_SUCCESS'
export const LOAD_NEXT_CONTENT_FAILURE = 'LOAD_NEXT_CONTENT_FAILURE'

// Should these be `POST.JSON, POST.FORM` instead?
export const POST_JSON = 'POST_JSON'
export const POST_FORM = 'POST_FORM'

export const SET_LAYOUT_MODE = 'SET_LAYOUT_MODE'

export const ALERT = {
  OPEN: 'ALERT.OPEN',
  CLOSE: 'ALERT.CLOSE',
}

export const AUTHENTICATION = {
  FORGOT_PASSWORD: 'AUTHENTICATION.FORGOT_PASSWORD',
  LOGOUT: 'AUTHENTICATION.LOGOUT',

  USER: 'AUTHENTICATION.USER',
  USER_REQUEST: 'AUTHENTICATION.USER_REQUEST',
  USER_SUCCESS: 'AUTHENTICATION.USER_SUCCESS',
  USER_FAILURE: 'AUTHENTICATION.USER_FAILURE',
}

export const COMMENT = {
  DELETE: 'COMMENT.DELETE',
  DELETE_REQUEST: 'COMMENT.DELETE_REQUEST',
  DELETE_SUCCESS: 'COMMENT.DELETE_SUCCESS',
  DELETE_FAILURE: 'COMMENT.DELETE_FAILURE',

  EDIT: 'COMMENT.EDIT',
  EDIT_REQUEST: 'COMMENT.EDIT_REQUEST',
  EDIT_SUCCESS: 'COMMENT.EDIT_SUCCESS',
  EDIT_FAILURE: 'COMMENT.EDIT_FAILURE',

  FLAG: 'COMMENT.FLAG',
  FLAG_REQUEST: 'COMMENT.FLAG_REQUEST',
  FLAG_SUCCESS: 'COMMENT.FLAG_SUCCESS',
  FLAG_FAILURE: 'COMMENT.FLAG_FAILURE',
}

export const EMOJI = {
  LOAD: 'EMOJI.LOAD',
  LOAD_REQUEST: 'EMOJI.LOAD_REQUEST',
  LOAD_SUCCESS: 'EMOJI.LOAD_SUCCESS',
  LOAD_FAILURE: 'EMOJI.LOAD_FAILURE',
}

export const INVITATIONS = {
  INVITE: 'INVITATIONS.INVITE',
  INVITE_REQUEST: 'INVITATIONS.INVITE_REQUEST',
  INVITE_SUCCESS: 'INVITATIONS.INVITE_SUCCESS',
  INVITE_FAILURE: 'INVITATIONS.INVITE_FAILURE',
}

export const MODAL = {
  OPEN: 'MODAL.OPEN',
  CLOSE: 'MODAL.CLOSE',
}

export const OMNIBAR = {
  OPEN: 'OMNIBAR.OPEN',
  CLOSE: 'OMNIBAR.CLOSE',
}

export const POST = {
  AUTO_COMPLETE: 'POST.AUTO_COMPLETE',
  AUTO_COMPLETE_REQUEST: 'POST.AUTO_COMPLETE_REQUEST',
  AUTO_COMPLETE_SUCCESS: 'POST.AUTO_COMPLETE_SUCCESS',
  AUTO_COMPLETE_FAILURE: 'POST.AUTO_COMPLETE_FAILURE',

  AUTO_COMPLETE_CLEAR: 'POST.AUTO_COMPLETE_CLEAR',

  COMMENT: 'POST.COMMENT',
  COMMENT_REQUEST: 'POST.COMMENT_REQUEST',
  COMMENT_SUCCESS: 'POST.COMMENT_SUCCESS',
  COMMENT_FAILURE: 'POST.COMMENT_FAILURE',

  CREATE: 'POST.CREATE',
  CREATE_REQUEST: 'POST.CREATE_REQUEST',
  CREATE_SUCCESS: 'POST.CREATE_SUCCESS',
  CREATE_FAILURE: 'POST.CREATE_FAILURE',

  DELETE: 'POST.DELETE',
  DELETE_REQUEST: 'POST.DELETE_REQUEST',
  DELETE_SUCCESS: 'POST.DELETE_SUCCESS',
  DELETE_FAILURE: 'POST.DELETE_FAILURE',

  EDIT: 'POST.EDIT',
  EDIT_REQUEST: 'POST.EDIT_REQUEST',
  EDIT_SUCCESS: 'POST.EDIT_SUCCESS',
  EDIT_FAILURE: 'POST.EDIT_FAILURE',

  FLAG: 'POST.FLAG',
  FLAG_REQUEST: 'POST.FLAG_REQUEST',
  FLAG_SUCCESS: 'POST.FLAG_SUCCESS',
  FLAG_FAILURE: 'POST.FLAG_FAILURE',

  LOVE: 'POST.LOVE',
  LOVE_REQUEST: 'POST.LOVE_REQUEST',
  LOVE_SUCCESS: 'POST.LOVE_SUCCESS',
  LOVE_FAILURE: 'POST.LOVE_FAILURE',

  PERSIST: 'POST.PERSIST',

  REPOST: 'POST.REPOST',
  REPOST_REQUEST: 'POST.REPOST_REQUEST',
  REPOST_SUCCESS: 'POST.REPOST_SUCCESS',

  // used for previewing an embed
  POST_PREVIEW: 'POST.POST_PREVIEW',
  POST_PREVIEW_REQUEST: 'POST.POST_PREVIEW_REQUEST',
  POST_PREVIEW_SUCCESS: 'POST.POST_PREVIEW_SUCCESS',
  POST_PREVIEW_FAILURE: 'POST.POST_PREVIEW_FAILURE',

  // adding an image block stuff
  TMP_IMAGE_CREATED: 'POST.TMP_IMAGE_CREATED',
  IMAGE_BLOCK_CREATED: 'POST.IMAGE_BLOCK_CREATED',
  SAVE_IMAGE: 'POST.SAVE_IMAGE',
  SAVE_IMAGE_REQUEST: 'POST.SAVE_IMAGE_REQUEST',
  SAVE_IMAGE_SUCCESS: 'POST.SAVE_IMAGE_SUCCESS',
  SAVE_IMAGE_FAILURE: 'POST.SAVE_IMAGE_FAILURE', REPOST_FAILURE: 'POST.REPOST_FAILURE',

  TOGGLE_COMMENTS: 'POST.TOGGLE_COMMENTS',
}


export const PROFILE = {
  LOAD: 'PROFILE.LOAD',
  LOAD_REQUEST: 'PROFILE.LOAD_REQUEST',
  LOAD_SUCCESS: 'PROFILE.LOAD_SUCCESS',
  LOAD_FAILURE: 'PROFILE.LOAD_FAILURE',

  SAVE: 'PROFILE.SAVE',
  SAVE_REQUEST: 'PROFILE.SAVE_REQUEST',
  SAVE_SUCCESS: 'PROFILE.SAVE_SUCCESS',
  SAVE_FAILURE: 'PROFILE.SAVE_FAILURE',

  SAVE_AVATAR: 'PROFILE.SAVE_AVATAR',
  SAVE_AVATAR_REQUEST: 'PROFILE.SAVE_AVATAR_REQUEST',
  SAVE_AVATAR_SUCCESS: 'PROFILE.SAVE_AVATAR_SUCCESS',
  SAVE_AVATAR_FAILURE: 'PROFILE.SAVE_AVATAR_FAILURE',

  SAVE_COVER: 'PROFILE.SAVE_COVER',
  SAVE_COVER_REQUEST: 'PROFILE.SAVE_COVER_REQUEST',
  SAVE_COVER_SUCCESS: 'PROFILE.SAVE_COVER_SUCCESS',
  SAVE_COVER_FAILURE: 'PROFILE.SAVE_COVER_FAILURE',

  TMP_AVATAR_CREATED: 'PROFILE.TMP_AVATAR_CREATED',
  TMP_COVER_CREATED: 'PROFILE.TMP_COVER_CREATED',

  AVAILABILITY: 'PROFILE.AVAILABILITY',
  AVAILABILITY_REQUEST: 'PROFILE.AVAILABILITY_REQUEST',
  AVAILABILITY_SUCCESS: 'PROFILE.AVAILABILITY_SUCCESS',
  AVAILABILITY_FAILURE: 'PROFILE.AVAILABILITY_FAILURE',

  REQUEST_INVITE: 'PROFILE.REQUEST_INVITE',
  REQUEST_INVITE_REQUEST: 'PROFILE.REQUEST_INVITE_REQUEST',
  REQUEST_INVITE_SUCCESS: 'PROFILE.REQUEST_INVITE_SUCCESS',
  REQUEST_INVITE_FAILURE: 'PROFILE.REQUEST_INVITE_FAILURE',

  DELETE: 'PROFILE.DELETE',
  DELETE_REQUEST: 'PROFILE.DELETE_REQUEST',
  DELETE_SUCCESS: 'PROFILE.DELETE_SUCCESS',
  DELETE_FAILURE: 'PROFILE.DELETE_FAILURE',
}

export const RELATIONSHIPS = {
  BATCH_UPDATE_INTERNAL: 'RELATIONSHIPS.BATCH_UPDATE_INTERNAL',
  UPDATE_INTERNAL: 'RELATIONSHIPS.UPDATE_INTERNAL',

  UPDATE: 'RELATIONSHIPS.UPDATE',
  UPDATE_REQUEST: 'RELATIONSHIPS.UPDATE_REQUEST',
  UPDATE_SUCCESS: 'RELATIONSHIPS.UPDATE_SUCCESS',
  UPDATE_FAILURE: 'RELATIONSHIPS.UPDATE_FAILURE',
}

export const TRACK = {
  EVENT: 'TRACK.EVENT',
  PAGE_VIEW: 'TRACK.PAGE_VIEW',
}
