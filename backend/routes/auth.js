const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma/client')
const { requireAuth } = require('../middleware/auth')

const upload = require('../middleware/upload')
const router = express.Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (!['LEARNER', 'OWNER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: passwordHash, role },
    })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me — get current logged-in user's profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        photoUrl: true, phone: true, address: true, city: true, state: true, pincode: true, bio: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

// PATCH /api/auth/me — update name/email
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, address, city, state, pincode, bio } = req.body

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== req.user.userId) {
        return res.status(409).json({ error: 'That email is already in use' })
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
        city: city ?? undefined,
        state: state ?? undefined,
        pincode: pincode ?? undefined,
        bio: bio ?? undefined,
      },
      select: {
        id: true, name: true, email: true, role: true,
        photoUrl: true, phone: true, address: true, city: true, state: true, pincode: true, bio: true,
      },
    })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// POST /api/auth/me/photo — upload profile photo
router.post('/me/photo', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const photoUrl = `/uploads/${req.file.filename}`
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { photoUrl },
      select: { id: true, name: true, email: true, role: true, photoUrl: true },
    })

    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to upload photo' })
  }
})

// PATCH /api/auth/password — change password
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: newHash },
    })

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update password' })
  }
})

module.exports = router