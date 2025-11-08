const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['wrong_location', 'harassment', 'overcharge', 'other'], required: true },
  message: String,
  stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Report', ReportSchema)
