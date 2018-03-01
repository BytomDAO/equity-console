import Connection from './connection'

class Client {
  constructor(opts = {}) {
    const option = (opts as any);
    (this as any).connection = new Connection(option.url, option.accessToken, option.agent)
  }

  public compile(contract, args = null) {
    return (this as any).connection.request('/compile', {contract, args})
  }

  public listAccounts() {
    return (this as any).connection.request('/list-accounts')
  }

  public listAssets() {
    return (this as any).connection.request('/list-assets')
  }

  public listBalances() {
    return (this as any).connection.request('/list-balances')
  }
}

export default Client
