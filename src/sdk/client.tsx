import Connection from './connection'
import transactionsAPI from './transactions'

class Client {
  connection: Connection
  transactions: Object

  constructor(opts = {}) {
    const option = (opts as any);
    this.connection = new Connection(option.url, option.accessToken, option.agent)
    this.transactions = transactionsAPI(this)
  }

  public compile(contract, args: any = null) {
    return this.connection.request('/compile', {contract, args})
  }

  public listAccounts() {
    return this.connection.request('/list-accounts')
  }

  public listAssets() {
    return this.connection.request('/list-assets')
  }

  public listBalances() {
    return this.connection.request('/list-balances')
  }

  public createAccountPubkey(accountInfo) {
    return this.connection
      .request('/create-account-pubkey', {account_info: accountInfo})
      .then(resp => resp.data)
  }

  public listUpspentUtxos(params) {
    return this.connection.request('/list-unspent-outputs', params).then(resp => {
      if (resp.status === 'success') {
        return resp.data
      } else {
        return []
      }
    })
  }
}

export default Client
