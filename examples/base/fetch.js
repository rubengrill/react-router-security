import isomorphicFetch from 'isomorphic-fetch'


export default function fetch(input, init) {
  return isomorphicFetch(input, init).then(response => {
    if (response.status >= 400) {
      return Promise.reject({ status: response.status, response })
    }
    return response
  })
}
