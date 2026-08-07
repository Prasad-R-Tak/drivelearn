const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('LEARNER'))

// GET /api/learner/dashboard — this learner's profile + all their enrollments across every school
router.get('/dashboard', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.userId },
      include: {
        course: true,
        school: { select: { id: true, name: true, city: true, locality: true } },
        batch: true,
        instructor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { id: 'desc' },
    })

    const courseIds = enrollments.map((e) => e.courseId)
    const myReviews = await prisma.review.findMany({
      where: { userId: req.user.userId, courseId: { in: courseIds } },
    })

    const bookings = enrollments.map((e) => ({
      id: e.id,
      schoolId: e.school.id,
      schoolName: e.school.name,
      schoolLocation: `${e.school.locality}, ${e.school.city}`,
      courseId: e.courseId,
      courseName: e.course.name,
      progress: e.progress,
      status: e.status === 'COMPLETED' ? 'Completed' : 'Active',
      batchStartDate: e.batch ? e.batch.startDate : null,
      totalLessons: e.batch ? e.batch.totalLessons : null,
      instructorName: e.instructor ? e.instructor.user.name : null,
      hasReviewed: myReviews.some((r) => r.courseId === e.courseId),
    }))

    const stats = {
      totalBookings: bookings.length,
      activeCourses: bookings.filter((b) => b.status === 'Active').length,
      completedCourses: bookings.filter((b) => b.status === 'Completed').length,
    }

    res.json({ user, stats, bookings })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

module.exports = router