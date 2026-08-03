const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// POST /api/bookings — a logged-in learner books a course
router.post('/', requireAuth, requireRole('LEARNER'), async (req, res) => {
  try {
    const { courseId } = req.body

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' })
    }

    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } })
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })

    const enrollment = await prisma.enrollment.create({
      data: {
        studentName: user.name,
        progress: 0,
        status: 'ACTIVE',
        schoolId: course.schoolId,
        courseId: course.id,
        userId: user.id,
      },
    })

    res.status(201).json(enrollment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Booking failed' })
  }
})

module.exports = router