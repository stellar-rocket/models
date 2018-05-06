import Mongoose from 'mongoose'
import Delogger from 'delogger'
import Crypto from 'crypto-js'

import Seed from './seed'
import Hash from './hash'
import Config from '../utils/config'

const config = new Config({sync: true})
const MAX_HASH = config.gameByRun
const log = new Delogger('CurrentRun')

const currentRunSchema = Mongoose.Schema({
  runId: Number,
  position: Number,
  seed: { type: Mongoose.Schema.ObjectId, ref: 'Seed' },
  chain: [{ type: Mongoose.Schema.ObjectId, ref: 'Hash' }]
})

currentRunSchema.statics.findLatestsRuns = function (count, from) {
  return new Promise((resolve, reject) => {
    this.find({}).sort({ runId: -1 }).limit(1).then((result) => {
      let maxRunId = result[0].runId
      return this.find({
        runId: {
          $lt: from ? Math.min(from, maxRunId) : maxRunId
        }
      }).sort({ runId: -1 }).limit(count).populate('seed')
    }).then((docs) => {
      resolve(docs.map((doc) => {
        return {
          runId: doc.runId,
          seed: doc.seed.value
        }
      }))
    }).catch((err) => {
      log.error('Failed to get lasts runs')
      log.error(err)
      reject(err)
    })
  })
}

currentRunSchema.statics.findLatestsHashs = function (count, from) {
  return new Promise((resolve, reject) => {
    this.find({}).sort({ runId: -1 }).limit(1).then((result) => {
      let lastCrash = result[0].position + 1
      return Hash.find({
        runId: result[0]._id,
        position: {
          $gt: Math.max(lastCrash, from)
        }
      }).limit(count).populate('runId')
    }).then((docs) => {
      resolve(docs.map((doc) => {
        return {
          value: doc.value,
          position: doc.position,
          runId: doc.runId.runId
        }
      }))
    }).catch((err) => {
      log.error('Failed to get lasts hashs')
      log.error(err)
      reject(err)
    })
  })
}

currentRunSchema.statics.findLatestOrCreate = function () {
  return new Promise((resolve, reject) => {
    this.find({}).sort({ position: -1 }).limit(1).then((result) => {
      if (result.length > 0) {
        return resolve(result[0])
      }

      return this.create({
        runId: 0,
        position: null,
        seed: null,
        chain: []
      })
    }).then(resolve).catch((err) => {
      log.error('Failed to find latest run')
      reject(err)
    })
  })
}

currentRunSchema.methods.generateHashChain = function () {
  return new Promise((resolve, reject) => {
    this.position = MAX_HASH
    log.info(`Generating hash chain n°${this.runId}`)

    let rand = Math.random().toString()
    const seed = new Seed({
      value: Crypto.SHA256(rand).toString(),
      runId: this
    })
    this.seed = seed

    var chain = []

    let lastHash = seed

    for (let i = 1; i <= MAX_HASH; i++) {
      let hash = new Hash({
        position: i,
        value: Crypto.SHA256(lastHash.value).toString(),
        runId: this._id
      })

      chain.push(hash)
      this.chain.push(hash)
      lastHash = hash
    }

    Promise.all([
      seed.save(),
      Hash.collection.insert(chain),
      this.save()
    ]).then(() => {
      log.info(`Finish hash chain generation n°${this.runId}`)
      resolve()
    }).catch((err) => {
      log.error(`Failed to generate chain n°${this.runId}`)
      log.error(err)
      reject(err)
    })
  })
}

const CurrentRun = Mongoose.model('CurrentRun', currentRunSchema)

export default CurrentRun
