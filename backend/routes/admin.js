const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('ADMIN'))

// GET /api/admin/schools — all schools, any status
router.get('/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: { owner: { select: { name: true, email: true } }, courses: true },
      orderBy: { id: 'desc' },
    })

    res.json(
      schools.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        locality: s.locality,
        status: s.status,
        ownerName: s.owner.name,
        ownerEmail: s.owner.email,
        courseCount: s.courses.length,
      }))
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load schools' })
  }
})

// PATCH /api/admin/schools/:id/status
router.patch('/schools/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const school = await prisma.school.update({ where: { id: Number(req.params.id) }, data: { status } })
    res.json(school)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update school status' })
  }
})

module.exports = router