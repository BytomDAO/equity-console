export class TransactionBuilder {
  actions: any
  baseTransaction: any
  ttl: any

  /**
   * constructor - return a new object used for constructing a transaction.
   */
  constructor() {
    this.actions = []
    this.baseTransaction = null
    this.ttl = 0
  }

  /**
   * Add an action that issues assets.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.assetId - Asset ID specifying the asset to be issued.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.assetAlias - Asset alias specifying the asset to be issued.
   *                                      You must specify either an ID or an alias.
   * @param {String} params.amount - Amount of the asset to be issued.
   */
  issue(params) {
    this.actions.push(Object.assign({}, params, {type: 'issue'}))
  }

  /**
   * Add an action that controls assets with an account specified by identifier.
   *
   * @param {Object} params - Action parameters.
   * @option params [String] :assetId Asset ID specifying the asset to be controlled.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.assetAlias - Asset alias specifying the asset to be controlled.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.accountId - Account ID specifying the account controlling the asset.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.accountAlias - Account alias specifying the account controlling the asset.
   *                                   You must specify either an ID or an alias.
   * @param {Number} params.amount - Amount of the asset to be controlled.
   */
  controlWithAccount(params) {
    this.actions.push(Object.assign({}, params, {type: 'control_account'}))
  }

  /**
   * Add an action that controls assets with a receiver.
   *
   * @param {Object} params - Action parameters.
   * @param {Object} params.receiver - The receiver object in which assets will be controlled.
   * @param {String} params.assetId - Asset ID specifying the asset to be controlled.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.assetAlias - Asset alias specifying the asset to be controlled.
   *                                   You must specify either an ID or an alias.
   * @param {Number} params.amount - Amount of the asset to be controlled.
   */
  controlWithReceiver(params) {
    const newParams = {
      amount: params.amount,
      asset_id: params.assetId,
      receiver: {
        control_program: params.receiver.controlProgram,
        expires_at: params.receiver.expiresAt
      }
    }
    this.actions.push(Object.assign({}, newParams, {type: 'control_receiver'}))
  }

  /**
   * Add an action that spends assets from an account specified by identifier.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.assetId - Asset ID specifying the asset to be spent.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.assetAlias - Asset alias specifying the asset to be spent.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.accountId - Account ID specifying the account spending the asset.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.accountAlias - Account alias specifying the account spending the asset.
   *                                   You must specify either an ID or an alias.
   * @param {Number} params.amount - Amount of the asset to be spent.
   */
  spendFromAccount(params) {
    this.actions.push(Object.assign({}, {
      account_id: params.accountId,
      amount: params.amount,
      asset_id: params.assetId
    }, {type: 'spend_account'}))
  }

  /**
   * Add an action that spends an unspent output.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.outputId - ID of the transaction output to be spent.
   */
  spendUnspentOutput(params) {
    this.actions.push(Object.assign({}, params, {type: 'spend_account_unspent_output'}))
  }

  /**
   * Add an action that spends an arbitrary unspent output not linked to an account.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.outputId - ID of the transaction output to be spent.
   */
  spendAnyUnspentOutput(params) {
    this.actions.push(Object.assign({}, params, {type: 'spend_unspent_output'}))
  }

  /**
   * Add an action that retires units of an asset.
   *
   * @param {Object} params - Action parameters.
   * @param {String} params.assetId - Asset ID specifying the asset to be retired.
   *                                   You must specify either an ID or an alias.
   * @param {String} params.assetAlias - Asset alias specifying the asset to be retired.
   *                                   You must specify either an ID or an alias.
   * @param {Number} params.amount - Amount of the asset to be retired.
   */
  retire(params) {
    this.actions.push(Object.assign({}, params, {type: 'retire'}))
  }

  /**
   * transactionReferenceData - Sets the transaction-level reference data. May
   *                            only be used once per transaction.
   *
   * @param {Object} referenceData - User specified, unstructured data to
   *                                  be embedded in a transaction.
   */
  transactionReferenceData(referenceData) {
    this.actions.push({
      type: 'set_transaction_reference_data',
      referenceData
    })
  }
}

const transactionsAPI = (client) => {
  return {
    build: (builderBlock, cb) => {
      const builder = new TransactionBuilder()
      builderBlock(builder)

      return client.connection.request('/build-transaction', builder)
    },

    signAndSbmit: (body) => {
      return client.connection.request('/sign-submit-transaction', body, true)
    }
  }
}

export default transactionsAPI
