const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// GET /api/schools — list all schools, with computed starting price
router.get('/', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      where: { status: 'APPROVED' },
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

// GET /api/schools/:id — single school detail, with full course + review info
router.get('/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        courses: {
          include: {
            slots: {
              where: { isBooked: false, dateTime: { gte: new Date() } },
              orderBy: { dateTime: 'asc' },
            },
          },
        },
        reviewsList: {
          include: {
            user: { select: { name: true } },
            course: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
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

// GET /api/schools/:id/my-bookings — logged-in learner's bookings + existing reviews at this school
router.get('/:id/my-bookings', requireAuth, requireRole('LEARNER'), async (req, res) => {
  try {
    const schoolId = Number(req.params.id)

    const enrollments = await prisma.enrollment.findMany({
      where: { schoolId, userId: req.user.userId },
      include: { course: true, slot: true },
    })

    // De-duplicate by course (in case someone booked the same course twice)
    const seen = new Set()
    const uniqueCourses = enrollments.filter((e) => {
      if (seen.has(e.courseId)) return false
      seen.add(e.courseId)
      return true
    })

    const courseIds = uniqueCourses.map((e) => e.courseId)
    const existingReviews = await prisma.review.findMany({
      where: { userId: req.user.userId, courseId: { in: courseIds } },
    })

    const result = uniqueCourses.map((e) => {
      const review = existingReviews.find((r) => r.courseId === e.courseId)
      return {
        courseId: e.courseId,
        courseName: e.course.name,
        slotDateTime: e.slot ? e.slot.dateTime : null,
        review: review ? { rating: review.rating, comment: review.comment } : null,
      }
    })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load your bookings' })
  }
})

module.exports = router