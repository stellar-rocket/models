import Mongoose from 'mongoose'
import Delogger from 'delogger'

const log = new Delogger('User')

const userSchema = Mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  wallet: { type: Mongoose.Schema.ObjectId, ref: 'Wallet' }
})

const User = Mongoose.model('User', userSchema)

export default User
