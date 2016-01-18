
const apiBase = location.protocol + '//' 
                 + location.hostname 
                 + (location.port && ':' + location.port)


export const URL = {
  API_BASE: apiBase,
  SIGN_UP: apiBase + '/api/v1/user'
}