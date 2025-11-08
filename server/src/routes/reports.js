const express = require('express')
const router = express.Router()
const Report = require('../models/Report')
const { z } = require('zod')

// POST /api/reports
router.post('/', async (req, res) => {
  const schema = z.object({
    type: z.enum(['wrong_location', 'harassment', 'overcharge', 'other']),
    message: z.string().optional(),
    stageId: z.string().optional(),
    routeId: z.string().optional(),
  })

  try {
    const payload = schema.parse(req.body)
    const report = await Report.create(payload)
    res.status(201).json(report)
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Failed to submit report' })
  }
})

module.exports = router
