const mongoose = require('mongoose')

const SaccoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contacts: [{ type: String }],
  routes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
}, { timestamps: true })

module.exports = mongoose.model('Sacco', SaccoSchema)
