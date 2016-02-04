
const apiBase = location.protocol + '//' 
                 + location.hostname 
                 + (location.port && ':' + location.port)


export const ENDPOINTS = {
  API_BASE: apiBase,
  LOG_IN: apiBase + '/api/v1/users/login',
  LOG_OUT: apiBase + '/api/v1/users/logout',
  SIGN_UP: apiBase + '/api/v1/users',
  USER_FETCH: apiBase + '/api/v1/users',
}