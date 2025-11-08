const express = require('express')
const router = express.Router()
const Route = require('../models/Route')
const { requireAdmin } = require('../utils/admin')
const { verifyJWT } = require('../utils/auth')

// GET /api/routes
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    const find = q ? { $or: [{ 'origin.name': new RegExp(q, 'i') }, { 'destination.name': new RegExp(q, 'i') }] } : {}
    const routes = await Route.find(find)
      .select({ origin: 1, destination: 1, saccos: 1, stages: 1, avgFareOffPeak: 1, avgFarePeak: 1 })
      .lean()
    res.json({ routes })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to list routes' })
  }
})

// GET /api/routes/:id
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('saccos')
      .populate('stages')
      .lean()
    if (!route) return res.status(404).json({ error: 'Route not found' })
    res.json(route)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to get route' })
  }
})

// POST /api/routes (admin)
router.post('/', verifyJWT, requireAdmin, async (req, res) => {
  try {
    const route = await Route.create(req.body)
    res.status(201).json(route)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to create route' })
  }
})

// PATCH /api/routes/:id (admin)
router.patch('/:id', verifyJWT, requireAdmin, async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(route)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to update route' })
  }
})

// DELETE /api/routes/:id (admin)
router.delete('/:id', verifyJWT, requireAdmin, async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to delete route' })
  }
})

module.exports = router
