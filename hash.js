import Mongoose from 'mongoose'

const hashSchema = Mongoose.Schema({
  position: { type: Number, required: true },
  value: { type: String, required: true },
  runId: { type: Mongoose.Schema.ObjectId, ref: 'CurrentRun', required: true }
})

const Hash = Mongoose.model('Hash', hashSchema)

export default Hash
