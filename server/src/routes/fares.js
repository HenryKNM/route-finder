const express = require('express')
const router = express.Router()
const Fare = require('../models/Fare')
const { z } = require('zod')

// POST /api/fares
router.post('/', async (req, res) => {
  const schema = z.object({
    routeId: z.string().optional(),
    stageId: z.string().optional(),
    saccoId: z.string().optional(),
    amount: z.coerce.number(),
    period: z.enum(['off_peak', 'peak', 'unknown']).optional(),
    source: z.enum(['user', 'admin', 'partner']).optional(),
  })

  try {
    const payload = schema.parse(req.body)
    const fare = await Fare.create(payload)
    res.status(201).json(fare)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to submit fare' })
  }
})

// GET /api/fares/recent?routeId=...&limit=10
router.get('/recent', async (req, res) => {
  const { routeId, limit = 10 } = req.query
  const q = {}
  if (routeId) q.routeId = routeId
  try {
    const fares = await Fare.find(q).sort({ createdAt: -1 }).limit(Number(limit)).lean()
    res.json({ fares })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to fetch recent fares' })
  }
})

module.exports = router
