const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('../models/User')

async function main() {
  const { MONGODB_URI } = process.env
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env')
    process.exit(1)
  }

  // Read from process.env or CLI args
  const name = process.env.ADMIN_NAME || process.argv[2]
  const email = process.env.ADMIN_EMAIL || process.argv[3]
  const password = process.env.ADMIN_PASSWORD || process.argv[4]

  if (!email || !password) {
    console.error('Usage: ADMIN_NAME="Henry" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="secret" npm run create-admin')
    process.exit(1)
  }

  await mongoose.connect(MONGODB_URI, { dbName: 'route_finder' })
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const update = {
      name: name || undefined,
      email,
      passwordHash,
      role: 'admin',
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: update },
      { upsert: true, new: true }
    )

    console.log('Admin user upserted:', { id: user._id.toString(), email: user.email, role: user.role })
  } catch (err) {
    console.error('Failed to create admin:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

main()
