import Mongoose from 'mongoose'

const BetSchema = Mongoose.Schema({
  user: { type: Mongoose.Schema.ObjectId, ref: 'User', required: true },
  wallet: { type: Mongoose.Schema.ObjectId, ref: 'Wallet', required: true },
  hash: { type: Mongoose.Schema.ObjectId, ref: 'Hash', required: true },
  multiplicator: { type: Number, default: 1 }, // For auto close
  amount: { type: Number, required: true },
  profit: Number
})

const Bet = Mongoose.model('Bet', BetSchema)

export default Bet
