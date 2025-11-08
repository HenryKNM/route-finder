const mongoose = require('mongoose')

const FareSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage' },
  saccoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sacco' },
  amount: { type: Number, required: true },
  period: { type: String, enum: ['off_peak', 'peak', 'unknown'], default: 'unknown' },
  source: { type: String, enum: ['user', 'admin', 'partner'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
})

FareSchema.index({ routeId: 1, createdAt: -1 })

module.exports = mongoose.model('Fare', FareSchema)
