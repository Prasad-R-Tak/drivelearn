const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('OWNER'))

function totalLessonsFrom(durationStr) {
  const match = durationStr?.match(/\d+/)
  return match ? Number(match[0]) : 10
}

function generateLessonDates(startDate, totalLessons) {
  const dates = []
  const base = new Date(startDate)
  for (let i = 0; i < totalLessons; i++) {
    const d = new Date(base)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

// POST /api/owner/school
router.post('/school', async (req, res) => {
  try {
    const { name, city, locality } = req.body
    if (!name || !city || !locality) {
      return res.status(400).json({ error: 'name, city, and locality are required' })
    }
    const existing = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (existing) return res.status(409).json({ error: 'You already have a registered school' })
    const school = await prisma.school.create({
      data: { name, city, locality, rating: 0, reviews: 0, status: 'PENDING', ownerId: req.user.userId },
    })
    res.status(201).json(school)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to register school' })
  }
})

// PATCH /api/owner/school
router.patch('/school', async (req, res) => {
  try {
    const { name, city, locality } = req.body
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })
    const updated = await prisma.school.update({
      where: { id: school.id },
      data: { name: name ?? school.name, city: city ?? school.city, locality: locality ?? school.locality },
    })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update school' })
  }
})

// GET /api/owner/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { ownerId: req.user.userId },
      include: {
        courses: true,
        enrollments: { include: { course: true } },
        instructors: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    })

    if (!school) return res.json({ hasSchool: false })

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

    const instructors = school.instructors.map((i) => ({ id: i.id, name: i.user.name, email: i.user.email }))

    res.json({
      hasSchool: true,
      school: { id: school.id, name: school.name, city: school.city, locality: school.locality, status: school.status },
      stats: { totalStudents, activeCourses, bookingsThisMonth: totalStudents, avgRating },
      students,
      courses,
      instructors,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// POST /api/owner/students
router.post('/students', async (req, res) => {
  try {
    const { studentName, courseId } = req.body
    if (!studentName || !courseId) return res.status(400).json({ error: 'studentName and courseId are required' })
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })
    const course = await prisma.course.findFirst({ where: { id: Number(courseId), schoolId: school.id } })
    if (!course) return res.status(404).json({ error: 'Course not found for this school' })

    const enrollment = await prisma.enrollment.create({
      data: { studentName, progress: 0, status: 'ACTIVE', schoolId: school.id, courseId: course.id },
    })
    res.status(201).json(enrollment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add student' })
  }
})

// POST /api/owner/courses
router.post('/courses', async (req, res) => {
  try {
    const { name, duration, price } = req.body
    if (!name || !duration || !price) return res.status(400).json({ error: 'name, duration, and price are required' })
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })
    const course = await prisma.course.create({ data: { name, duration, price: Number(price), schoolId: school.id } })
    res.status(201).json(course)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add course' })
  }
})

// PATCH /api/owner/courses/:id
router.patch('/courses/:id', async (req, res) => {
  try {
    const { name, duration, price } = req.body
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })
    const course = await prisma.course.findFirst({ where: { id: Number(req.params.id), schoolId: school.id } })
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

// DELETE /api/owner/courses/:id
router.delete('/courses/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })
    const course = await prisma.course.findFirst({ where: { id: Number(req.params.id), schoolId: school.id } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const batches = await prisma.batch.findMany({ where: { courseId: course.id } })
    const batchIds = batches.map((b) => b.id)

    await prisma.review.deleteMany({ where: { courseId: course.id } })
    await prisma.enrollment.deleteMany({ where: { courseId: course.id } })
    await prisma.lessonDay.deleteMany({ where: { batchId: { in: batchIds } } })
    await prisma.batch.deleteMany({ where: { courseId: course.id } })
    await prisma.course.delete({ where: { id: course.id } })

    res.json({ message: 'Course deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})

// POST /api/owner/courses/:courseId/batches — creates a batch + auto-generates one lesson per day
router.post('/courses/:courseId/batches', async (req, res) => {
  try {
    const { startDate, instructorId } = req.body
    if (!startDate || !instructorId) {
      return res.status(400).json({ error: 'startDate and instructorId are required' })
    }

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({ where: { id: Number(req.params.courseId), schoolId: school.id } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const instructor = await prisma.instructor.findFirst({
      where: { id: Number(instructorId), schoolId: school.id },
    })
    if (!instructor) return res.status(400).json({ error: 'Invalid instructor for this school' })

    const totalLessons = totalLessonsFrom(course.duration)
    const lessonDates = generateLessonDates(startDate, totalLessons)

    const batch = await prisma.batch.create({
      data: {
        startDate: new Date(startDate),
        totalLessons,
        courseId: course.id,
        instructorId: instructor.id,
        lessonDays: { create: lessonDates.map((d) => ({ date: d })) },
      },
      include: { lessonDays: true },
    })

    res.status(201).json(batch)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create batch' })
  }
})

// GET /api/owner/courses/:courseId/batches
router.get('/courses/:courseId/batches', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const course = await prisma.course.findFirst({ where: { id: Number(req.params.courseId), schoolId: school.id } })
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const batches = await prisma.batch.findMany({
      where: { courseId: course.id },
      orderBy: { startDate: 'asc' },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        enrollment: { select: { studentName: true } },
      },
    })
    res.json(batches)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load batches' })
  }
})

// DELETE /api/owner/batches/:id
router.delete('/batches/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const batch = await prisma.batch.findUnique({ where: { id: Number(req.params.id) }, include: { course: true } })
    if (!batch || batch.course.schoolId !== school.id) return res.status(404).json({ error: 'Batch not found' })
    if (batch.isBooked) return res.status(409).json({ error: 'Cannot delete a booked batch' })

    await prisma.lessonDay.deleteMany({ where: { batchId: batch.id } })
    await prisma.batch.delete({ where: { id: batch.id } })
    res.json({ message: 'Batch deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete batch' })
  }
})

// POST /api/owner/instructors
router.post('/instructors', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required' })

    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(409).json({ error: 'An account with this email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)

    const instructor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name, email, password: passwordHash, role: 'INSTRUCTOR' } })
      return tx.instructor.create({
        data: { userId: user.id, schoolId: school.id },
        include: { user: { select: { id: true, name: true, email: true } } },
      })
    })

    res.status(201).json(instructor)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add instructor' })
  }
})

// GET /api/owner/instructors
router.get('/instructors', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({ where: { ownerId: req.user.userId } })
    if (!school) return res.status(404).json({ error: 'No school found for this owner' })

    const instructors = await prisma.instructor.findMany({
      where: { schoolId: school.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    res.json(instructors.map((i) => ({ id: i.id, name: i.user.name, email: i.user.email })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load instructors' })
  }
})

module.exports = router