const express = require('express')
const prisma = require('../prisma/client')

const router = express.Router()

// GET /api/schools — list all schools, with computed starting price
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: { courses: true },
    })

    const formatted = schools
      .filter((s) => s.courses.length > 0) // hide schools that haven't added courses yet
      .map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        locality: s.locality,
        rating: s.rating,
        reviews: s.reviews,
        price: Math.min(...s.courses.map((c) => c.price)),
        courses: s.courses.map((c) => c.name),
      }))

    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch schools' })
  }
})

// GET /api/schools/:id — single school detail, with full course + enrollment info
router.get('/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: Number(req.params.id) },
      include: { courses: true },
    })

    if (!school) {
      return res.status(404).json({ error: 'School not found' })
    }

    res.json(school)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch school' })
  }
})

module.exports = router