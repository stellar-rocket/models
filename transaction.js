import Mongoose from 'mongoose'
import Delogger from 'delogger'

const log = new Delogger('Transaction')

const transactionSchema = Mongoose.Schema({
  wallet: { type: Mongoose.Schema.ObjectId, ref: 'Wallet', required: true },
  type: { type: String, required: true, enum: ['deposit', 'withdraw', 'debit', 'credit', 'faucet'] },
  amount: { type: Number, required: true },
  status: { type: String, default: 'progress', enum: ['progress', 'done', 'refused', 'processing'] },
  address: { type: String },
  date: { type: Date, default: Date.now }
})

const Transaction = Mongoose.model('Transaction', transactionSchema)

export default Transaction
