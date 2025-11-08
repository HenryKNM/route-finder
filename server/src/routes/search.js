const express = require('express')
const router = express.Router()
const Stage = require('../models/Stage')
const Route = require('../models/Route')

// GET /api/search?text=Kahawa%20Sukari
router.get('/search', async (req, res) => {
  const text = (req.query.text || '').trim()
  if (!text) return res.json({ stages: [], routes: [] })

  try {
    const rx = new RegExp(text, 'i')

    // Base matches
    const matchedStages = await Stage.find({ $or: [{ name: rx }, { aliases: rx }] })
      .select({ name: 1, location: 1, routes: 1 })
      .limit(30)
      .lean()

    const matchedRoutes = await Route.find({ $or: [{ 'origin.name': rx }, { 'destination.name': rx }] })
      .select({ origin: 1, destination: 1, stages: 1, avgFareOffPeak: 1, avgFarePeak: 1 })
      .limit(30)
      .lean()

    // Expand: routes from matched stages
    const routeIdsFromStages = [...new Set(matchedStages.flatMap(s => (s.routes || []).map(String)))]
    const linkedRoutes = routeIdsFromStages.length
      ? await Route.find({ _id: { $in: routeIdsFromStages } })
          .select({ origin: 1, destination: 1, stages: 1, avgFareOffPeak: 1, avgFarePeak: 1 })
          .lean()
      : []

    // Expand: stages from matched routes
    const stageIdsFromRoutes = [...new Set(matchedRoutes.flatMap(r => (r.stages || []).map(String)))]
    const linkedStages = stageIdsFromRoutes.length
      ? await Stage.find({ _id: { $in: stageIdsFromRoutes } })
          .select({ name: 1, location: 1, routes: 1 })
          .lean()
      : []

    // Dedupe
    const stageMap = new Map()
    for (const s of [...matchedStages, ...linkedStages]) stageMap.set(String(s._id), s)
    const routeMap = new Map()
    for (const r of [...matchedRoutes, ...linkedRoutes]) routeMap.set(String(r._id), r)

    res.json({ stages: Array.from(stageMap.values()), routes: Array.from(routeMap.values()) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Search failed' })
  }
})

module.exports = router
