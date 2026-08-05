const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

// All routes here require a logged-in OWNER
router.use(requireAuth, requireRole('OWNER'))

// POST /api/owner/school — register a new school for the logged-in owner
router.post('/school', async (req, res) => {
  try {
    const { name, city, locality } = req.body

    if (!name || !city || !locality) {
      return res.status(400).json({ error: 'name, city, and locality are required' })
    }

    const existing = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (existing) {
      return res.status(409).json({ error: 'You already have a registered school' })
    }

    const school = await prisma.school.create({
      data: {
        name,
        city,
        locality,
        rating: 0,
        reviews: 0,
        ownerId: req.user.userId,
      },
    })

    res.status(201).json(school)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to register school' })
  }
})

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
      return res.json({ hasSchool: false })
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
      hasSchool: true,
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

// PATCH /api/owner/school — update school details
router.patch('/school', async (req, res) => {
  try {
    const { name, city, locality } = req.body

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const updated = await prisma.school.update({
      where: { id: school.id },
      data: {
        name: name ?? school.name,
        city: city ?? school.city,
        locality: locality ?? school.locality,
      },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update school' })
  }
})

// POST /api/owner/courses/:courseId/slots — add a lesson slot to a course
router.post('/courses/:courseId/slots', async (req, res) => {
  try {
    const { dateTime } = req.body
    if (!dateTime) return res.status(400).json({ error: 'dateTime is required' })

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({
      where: { id: Number(req.params.courseId), schoolId: school.id },
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const slot = await prisma.lessonSlot.create({
      data: { dateTime: new Date(dateTime), courseId: course.id },
    })

    res.status(201).json(slot)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add slot' })
  }
})

// GET /api/owner/courses/:courseId/slots — list all slots for a course
router.get('/courses/:courseId/slots', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({
      where: { id: Number(req.params.courseId), schoolId: school.id },
    })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const slots = await prisma.lessonSlot.findMany({
      where: { courseId: course.id },
      orderBy: { dateTime: 'asc' },
      include: { enrollment: { select: { studentName: true } } },
    })

    res.json(slots)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load slots' })
  }
})

// DELETE /api/owner/slots/:id — delete a slot (only if not booked)
router.delete('/slots/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const slot = await prisma.lessonSlot.findUnique({
      where: { id: Number(req.params.id) },
      include: { course: true },
    })
    if (!slot || slot.course.schoolId !== school.id) {
      return res.status(404).json({ error: 'Slot not found' })
    }
    if (slot.isBooked) {
      return res.status(409).json({ error: 'Cannot delete a booked slot' })
    }

    await prisma.lessonSlot.delete({ where: { id: slot.id } })
    res.json({ message: 'Slot deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete slot' })
  }
})

module.exports = router