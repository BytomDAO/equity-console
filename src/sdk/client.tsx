import Connection from './connection'

class Client {
  constructor(opts = {}) {
    const option = (opts as any);
    (this as any).connection = new Connection(option.url, option.accessToken, option.agent)
  }

  public compile(contract, args = null) {
    return (this as any).connection.request('/compile', {contract, args})
  }
}

export default Client
