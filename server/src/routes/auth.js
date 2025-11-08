const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const User = require('../models/User')
const { OAuth2Client } = require('google-auth-library')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null

function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['user', 'admin']).optional(),
  })
  try {
    const { email, password, role } = schema.parse(req.body)
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash, role: role || 'user' })
    const token = signToken(user)
    res.status(201).json({ token, role: user.role, email: user.email })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Signup failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
  try {
    const { email, password } = schema.parse(req.body)
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ token, role: user.role, email: user.email })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Login failed' })
  }
})

// POST /api/auth/google (placeholder)
// Expects { idToken } from Google Identity Services; verify on backend in production.
router.post('/google', async (req, res) => {
  try {
    if (!googleClient) return res.status(500).json({ error: 'Google auth not configured' })
    const schema = z.object({ idToken: z.string() })
    const { idToken } = schema.parse(req.body)

    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const email = payload?.email
    if (!email) return res.status(400).json({ error: 'No email in Google token' })

    let user = await User.findOne({ email })
    if (!user) {
      const random = await bcrypt.hash(jwt.sign({ email }, JWT_SECRET), 6)
      user = await User.create({ email, passwordHash: random, role: 'user' })
    }
    const token = signToken(user)
    res.json({ token, role: user.role, email: user.email })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: 'Google auth failed' })
  }
})

module.exports = router
