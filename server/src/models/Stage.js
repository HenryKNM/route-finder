const mongoose = require('mongoose')

const StageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  aliases: [{ type: String }],
}, { timestamps: true })

StageSchema.index({ location: '2dsphere' })
StageSchema.index({ name: 'text', aliases: 'text' })

module.exports = mongoose.model('Stage', StageSchema)
