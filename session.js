import Mongoose from 'mongoose'

const sessionSchema = Mongoose.Schema({
  uid: { type: String, required: true },
  user: { type: Mongoose.Schema.ObjectId, ref: 'User', required: true }
})

const Session = Mongoose.model('Session', sessionSchema)

export default Session
