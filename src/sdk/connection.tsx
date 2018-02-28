// FIXME: Microsoft Edge has issues returning errors for responses
// with a 401 status. We should add browser detection to only
// use the ponyfill for unsupported browsers.
const { fetch } = require('fetch-ponyfill')()

const blacklistAttributes = [
  'after',
  'asset_tags',
  'asset_definition',
  'account_tags',
  'next',
  'reference_data',
  'tags',
]

const snakeize = (object) => {
  for(let key in object) {
    let value = object[key]
    let newKey = key

    // Skip all-caps keys
    if (/^[A-Z]+$/.test(key)) {
      continue
    }

    if (/[A-Z]/.test(key)) {
      newKey = key.replace(/([A-Z])/g, v => `_${v.toLowerCase()}`)
      delete object[key]
    }

    if (typeof value == 'object' && blacklistAttributes.indexOf(newKey) == -1) {
      value = snakeize(value)
    }

    object[newKey] = value
  }

  return object
}

const camelize = (object) => {
  for (let key in object) {
    let value = object[key]
    let newKey = key

    if (/_/.test(key)) {
      newKey = key.replace(/([_][a-z])/g, v => v[1].toUpperCase())
      delete object[key]
    }

    if (typeof value == 'object' && blacklistAttributes.indexOf(key) == -1) {
      value = camelize(value)
    }

    object[newKey] = value
  }

  return object
}

class Connection {
  constructor(baseUrl, token = '', agent) {
    (this as any).baseUrl = baseUrl;
    (this as any).token = token || '';
  }

  request(path, body = {}, skipSnakeize = false) {
    if (!body) {
      body = {}
    }

    // Convert camelcased request body field names to use snakecase for API
    // processing.
    const snakeBody = skipSnakeize ? body : snakeize(body) // Ssssssssssss

    let req = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // 'Content-Type': 'application/json',

        // TODO(jeffomatic): The Fetch API has inconsistent behavior between
        // browser implementations and polyfills.
        //
        // - For Edge: we can't use the browser's fetch API because it doesn't
        // always returns a WWW-Authenticate challenge to 401s.
        // - For Safari/Chrome: using fetch-ponyfill (the polyfill) causes
        // console warnings if the user agent string is provided.
        //
        // For now, let's not send the UA string.
        //'User-Agent': 'chain-sdk-js/0.0'
      },
      body: JSON.stringify(snakeBody)
    }

    if ((this as any).token) {
      req.headers['Authorization'] = `Basic ${btoa((this as any).token)}`
    }

    return fetch((this as any).baseUrl + path, req).then(resp => {
      return resp.json().then(body => body)
    })
  }
}

(Connection as any).snakeize = snakeize
(Connection as any).camelize = camelize

export default Connection
