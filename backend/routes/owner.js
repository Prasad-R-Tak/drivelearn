const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// All routes here require a logged-in OWNER
router.use(requireAuth, requireRole('OWNER'))

// GET /api/owner/dashboard — overview + students + courses for the logged-in owner's school
router.get('/dashboard', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { ownerId: req.user.userId },
      include: {
        courses: true,
        enrollments: {
          include: { course: true },
        },
      },
    })

    if (!school) {
      return res.status(404).json({ error: 'No school found for this owner' })
    }

    const totalStudents = school.enrollments.length
    const activeCourses = school.courses.length
    const avgRating = school.rating

    const students = school.enrollments.map((e) => ({
      id: e.id,
      name: e.studentName,
      course: e.course.name,
      progress: e.progress,
      status: e.status === 'COMPLETED' ? 'Completed' : 'Active',
    }))

    const courses = school.courses.map((c) => ({
      id: c.id,
      name: c.name,
      duration: c.duration,
      price: c.price,
      enrolled: school.enrollments.filter((e) => e.courseId === c.id).length,
    }))

    res.json({
      school: { id: school.id, name: school.name, city: school.city, locality: school.locality },
      stats: {
        totalStudents,
        activeCourses,
        bookingsThisMonth: totalStudents, // placeholder until real bookings exist
        avgRating,
      },
      students,
      courses,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

module.exports = router