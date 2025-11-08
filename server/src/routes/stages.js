const express = require('express')
const router = express.Router()
const Stage = require('../models/Stage')
const { z } = require('zod')
const { requireAdmin } = require('../utils/admin')
const { verifyJWT } = require('../utils/auth')

// GET /api/stages/near?lng=36.82&lat=-1.29&radius=2000
router.get('/near', async (req, res) => {
  const schema = z.object({
    lng: z.coerce.number(),
    lat: z.coerce.number(),
    radius: z.coerce.number().default(2000),
  })

  try {
    const { lng, lat, radius } = schema.parse(req.query)
    const stages = await Stage.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    })
      .limit(50)
      .lean()

    res.json({ stages })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Invalid query' })
  }
})

// POST /api/stages (admin)
router.post('/', verifyJWT, requireAdmin, async (req, res) => {
  try {
    const stage = await Stage.create(req.body)
    res.status(201).json(stage)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to create stage' })
  }
})

// PATCH /api/stages/:id (admin)
router.patch('/:id', verifyJWT, requireAdmin, async (req, res) => {
  try {
    const stage = await Stage.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(stage)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to update stage' })
  }
})

// DELETE /api/stages/:id (admin)
router.delete('/:id', verifyJWT, requireAdmin, async (req, res) => {
  try {
    await Stage.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to delete stage' })
  }
})

module.exports = router
