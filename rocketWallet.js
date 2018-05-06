import Mongoose from 'mongoose'
import Delogger from 'delogger'

const log = new Delogger('RocketWallet')

const rocketWalletSchema = Mongoose.Schema({
  cursor: { type: String, default: '0' }, //BigInt
  address: { type: String, required: true },
  balance: { type: Number, default: 0 }
})

const RocketWallet = Mongoose.model('rocketWallet', rocketWalletSchema)

export default RocketWallet
