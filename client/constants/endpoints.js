
const apiBase = location.protocol + '//' 
                 + location.hostname 
                 + (location.port && ':' + location.port)


export const ENDPOINTS = {
  API_BASE: apiBase,
  LOG_IN: apiBase + '/api/v1/auth/login',
  SIGN_UP: apiBase + '/api/v1/user',
  USER_FETCH: apiBase + '/api/v1/user',
}