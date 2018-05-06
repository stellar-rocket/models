import Mongoose from 'mongoose'

const seedSchema = Mongoose.Schema({
  value: { type: String, required: true },
  runId: { type: Mongoose.Schema.ObjectId, ref: 'CurrentRun', required: true }
})

const Seed = Mongoose.model('Seed', seedSchema)

export default Seed
