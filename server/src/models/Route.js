const mongoose = require('mongoose')

const PointSchema = new mongoose.Schema({
  name: String,
  coordinates: { type: [Number], required: false }, // [lng, lat]
}, { _id: false })

const RouteSchema = new mongoose.Schema({
  origin: PointSchema,
  destination: PointSchema,
  saccos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sacco' }],
  stages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stage' }],
  avgFareOffPeak: Number,
  avgFarePeak: Number,
}, { timestamps: true })

module.exports = mongoose.model('Route', RouteSchema)
