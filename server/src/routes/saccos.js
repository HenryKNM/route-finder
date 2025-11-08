const express = require('express')
const router = express.Router()
const Sacco = require('../models/Sacco')
const { requireAdmin } = require('../utils/admin')

// GET /api/saccos
router.get('/', async (req, res) => {
  try {
    const saccos = await Sacco.find().lean()
    res.json({ saccos })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to fetch saccos' })
  }
})

// POST /api/saccos
router.post('/', requireAdmin, async (req, res) => {
  try {
    const sacco = await Sacco.create(req.body)
    res.status(201).json(sacco)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to create sacco' })
  }
})

// PATCH /api/saccos/:id
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const sacco = await Sacco.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(sacco)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to update sacco' })
  }
})

// DELETE /api/saccos/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Sacco.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to delete sacco' })
  }
})

module.exports = router
