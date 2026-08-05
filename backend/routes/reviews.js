const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// POST /api/reviews — learner submits/updates a review for a specific course they've booked
router.post('/', requireAuth, requireRole('LEARNER'), async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body

    if (!courseId || !rating) {
      return res.status(400).json({ error: 'courseId and rating are required' })
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' })
    }

    const course = await prisma.course.findUnique({ where: { id: Number(courseId) } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const hasBooked = await prisma.enrollment.findFirst({
      where: { courseId: Number(courseId), userId: req.user.userId },
    })
    if (!hasBooked) {
      return res.status(403).json({ error: 'You can only review courses you have booked' })
    }

    const review = await prisma.review.upsert({
      where: { courseId_userId: { courseId: Number(courseId), userId: req.user.userId } },
      update: { rating, comment },
      create: { courseId: Number(courseId), schoolId: course.schoolId, userId: req.user.userId, rating, comment },
    })

    // Recalculate the school's average rating across ALL its reviews (every course combined)
    const allReviews = await prisma.review.findMany({ where: { schoolId: course.schoolId } })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.school.update({
      where: { id: course.schoolId },
      data: { rating: Math.round(avgRating * 10) / 10, reviews: allReviews.length },
    })

    res.status(201).json(review)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit review' })
  }
})

module.exports = router