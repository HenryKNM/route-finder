const mongoose = require('mongoose')
require('dotenv').config()

const Stage = require('./models/Stage')
const Route = require('./models/Route')
const Sacco = require('./models/Sacco')
const Fare = require('./models/Fare')

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/route_finder'
  await mongoose.connect(MONGODB_URI, { dbName: 'route_finder' })
  console.log('Connected to MongoDB for seeding')

  try {
    // Create a sample Sacco
    const sacco = await Sacco.findOneAndUpdate(
      { name: 'City Shuttle' },
      { name: 'City Shuttle', contacts: ['+254700000000'] },
      { upsert: true, new: true }
    )

    // Create a sample Route (CBD -> Kahawa)
    const route = await Route.findOneAndUpdate(
      { 'origin.name': 'CBD', 'destination.name': 'Kahawa' },
      {
        origin: { name: 'CBD', coordinates: [36.817223, -1.286389] },
        destination: { name: 'Kahawa', coordinates: [36.955, -1.183] },
        saccos: [sacco._id],
        avgFareOffPeak: 70,
        avgFarePeak: 100,
      },
      { upsert: true, new: true }
    )

    // Create a couple of pickup stages
    const stageCBD = await Stage.findOneAndUpdate(
      { name: 'CBD Koja Stage' },
      {
        name: 'CBD Koja Stage',
        location: { type: 'Point', coordinates: [36.829, -1.283] },
      },
      { upsert: true, new: true }
    )

    const stageKahawa = await Stage.findOneAndUpdate(
      { name: 'Kahawa Stage' },
      {
        name: 'Kahawa Stage',
        location: { type: 'Point', coordinates: [36.955, -1.183] },
      },
      { upsert: true, new: true }
    )

    // Link stages to route
    if (!route.stages || route.stages.length === 0) {
      route.stages = [stageCBD._id, stageKahawa._id]
      await route.save()
    }

    // Ensure reverse refs (optional)
    await Stage.updateMany({ _id: { $in: [stageCBD._id, stageKahawa._id] } }, { $addToSet: { routes: route._id } })

    // Add a recent fare
    await Fare.create({ routeId: route._id, stageId: stageCBD._id, saccoId: sacco._id, amount: 80, period: 'off_peak', source: 'admin' })

    console.log('Seed completed: sample Sacco, Route, Stages, Fare created')
  } catch (err) {
    console.error('Seeding error:', err)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

run()
