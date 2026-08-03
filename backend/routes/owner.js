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
// POST /api/owner/students — owner manually adds a student to a course
router.post('/students', async (req, res) => {
  try {
    const { studentName, courseId } = req.body
    if (!studentName || !courseId) {
      return res.status(400).json({ error: 'studentName and courseId are required' })
    }

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({
      where: { id: Number(courseId), schoolId: school.id },
    })
    if (!course) return res.status(404).json({ error: 'Course not found for this school' })

    const enrollment = await prisma.enrollment.create({
      data: {
        studentName,
        progress: 0,
        status: 'ACTIVE',
        schoolId: school.id,
        courseId: course.id,
      },
    })

    res.status(201).json(enrollment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add student' })
  }
})

// POST /api/owner/courses — owner adds a new course
router.post('/courses', async (req, res) => {
  try {
    const { name, duration, price } = req.body
    if (!name || !duration || !price) {
      return res.status(400).json({ error: 'name, duration, and price are required' })
    }

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.create({
      data: { name, duration, price: Number(price), schoolId: school.id },
    })

    res.status(201).json(course)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add course' })
  }
})

// PATCH /api/owner/courses/:id — owner edits an existing course
router.patch('/courses/:id', async (req, res) => {
  try {
    const { name, duration, price } = req.body

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({
      where: { id: Number(req.params.id), schoolId: school.id },
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const updated = await prisma.course.update({
      where: { id: course.id },
      data: {
        name: name ?? course.name,
        duration: duration ?? course.duration,
        price: price !== undefined ? Number(price) : course.price,
      },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update course' })
  }
})
module.exports = router