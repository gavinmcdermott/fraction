'use strict'


export default function handleJSON(req) {
  return req.json()
    .then((json) => {
      if (!json.ok) {
        return Promise.reject(json)
      }
      return Promise.resolve(json)
    })
}



