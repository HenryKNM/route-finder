const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/route_finder'
mongoose
  .connect(MONGODB_URI, { dbName: 'route_finder' })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err))

// Routes
const searchRoutes = require('./routes/search')
const stagesRoutes = require('./routes/stages')
const routesRoutes = require('./routes/routes')
const faresRoutes = require('./routes/fares')
const reportsRoutes = require('./routes/reports')
const saccosRoutes = require('./routes/saccos')
const authRoutes = require('./routes/auth')

app.use('/api', searchRoutes)
app.use('/api/stages', stagesRoutes)
app.use('/api/routes', routesRoutes)
app.use('/api/fares', faresRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/saccos', saccosRoutes)
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
