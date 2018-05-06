import Mongoose from 'mongoose'
import Delogger from 'delogger'

import Transaction from './transaction'

const log = new Delogger('Wallet')

const walletSchema = Mongoose.Schema({
  user: { type: Mongoose.Schema.ObjectId, ref: 'User', unique: true, required: true },
  balance: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  transactions: [{ type: Mongoose.Schema.ObjectId, ref: 'Transaction' }]
})

walletSchema.methods.appendTransaction = function (transaction) {
  return new Promise((resolve, reject) => {
    if (!(transaction instanceof Transaction)) {
      return new Error('Invalid transaction')
    }

    let futurBalance = 0
    switch (transaction.type) {
      case 'deposit':
      case 'credit':
      case 'faucet':
        futurBalance = Math.floor(this.balance - transaction.amount)
        transaction.status = 'done'
        Promise.all([
          this.update({
            $inc: {
              balance: transaction.amount
            },
            $push: {
              transactions: transaction
            }
          }),
          transaction.save()
        ]).then(() => {
          this.balance = futurBalance
          this.transactions.push(transaction)
          resolve()
        }).catch(reject)
        break

      case 'withdraw':
      case 'debit':
        if (transaction.type === 'withdraw' && this.locked) {
          transaction.status = 'refused'
          return transaction.save().then(resolve).catch(reject)
        }

        futurBalance = Math.floor(this.balance - transaction.amount)
        if (futurBalance < 0) {
          return new Error('Insufficient Funds')
        }
        if (transaction.type === 'debit') {
          transaction.status = 'done'
        }

        Promise.all([
          this.update({
            $inc: {
              balance: -transaction.amount
            },
            $push: {
              transactions: transaction
            }
          }),
          transaction.save()
        ]).then(() => {
          this.balance = futurBalance
          this.transactions.push(transaction)
          resolve()
        }).catch(reject)
        break

      default:
        reject(new Error('Invalid transaction type'))
    }
  })
}

const Wallet = Mongoose.model('Wallet', walletSchema)

export default Wallet
