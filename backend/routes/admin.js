const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('ADMIN'))

// GET /api/admin/stats — platform-wide overview
router.get('/stats', async (req, res) => {
  try {
    const [totalSchools, pendingSchools, approvedSchools, totalLearners, totalOwners, totalInstructors, totalEnrollments, totalReviews] =
      await Promise.all([
        prisma.school.count(),
        prisma.school.count({ where: { status: 'PENDING' } }),
        prisma.school.count({ where: { status: 'APPROVED' } }),
        prisma.user.count({ where: { role: 'LEARNER' } }),
        prisma.user.count({ where: { role: 'OWNER' } }),
        prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
        prisma.enrollment.count(),
        prisma.review.count(),
      ])

    const courses = await prisma.course.findMany({ select: { price: true } })
    const enrollments = await prisma.enrollment.findMany({ select: { courseId: true } })
    const priceMap = {}
    const allCourses = await prisma.course.findMany({ select: { id: true, price: true } })
    allCourses.forEach((c) => (priceMap[c.id] = c.price))
    const estimatedRevenue = enrollments.reduce((sum, e) => sum + (priceMap[e.courseId] || 0), 0)

    res.json({
      totalSchools,
      pendingSchools,
      approvedSchools,
      totalLearners,
      totalOwners,
      totalInstructors,
      totalEnrollments,
      totalReviews,
      estimatedRevenue,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load stats' })
  }
})

// GET /api/admin/schools
router.get('/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        owner: { select: { name: true, email: true, phone: true, photoUrl: true } },
        courses: true,
        enrollments: true,
      },
      orderBy: { id: 'desc' },
    })

    res.json(
      schools.map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        locality: s.locality,
        status: s.status,
        rating: s.rating,
        reviews: s.reviews,
        ownerName: s.owner.name,
        ownerEmail: s.owner.email,
        ownerPhone: s.owner.phone,
        ownerPhoto: s.owner.photoUrl,
        courseCount: s.courses.length,
        studentCount: s.enrollments.length,
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

// GET /api/admin/users — all users, optional ?role= filter
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true, name: true, email: true, role: true, phone: true, city: true, photoUrl: true, createdAt: true,
      },
      orderBy: { id: 'desc' },
    })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load users' })
  }
})

// GET /api/admin/users/:id — full detail for one user, based on their role
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: {
        id: true, name: true, email: true, role: true, phone: true, address: true,
        city: true, state: true, pincode: true, bio: true, photoUrl: true, createdAt: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    let detail = {}

    if (user.role === 'LEARNER') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id },
        include: {
          course: true,
          school: { select: { id: true, name: true, city: true } },
          instructor: { include: { user: { select: { name: true } } } },
          batch: true,
        },
      })
      detail.enrollments = enrollments.map((e) => ({
        id: e.id,
        schoolId: e.school.id,
        schoolName: e.school.name,
        schoolCity: e.school.city,
        courseName: e.course.name,
        instructorName: e.instructor ? e.instructor.user.name : null,
        progress: e.progress,
        status: e.status,
        batchStartDate: e.batch ? e.batch.startDate : null,
      }))
    }

    if (user.role === 'OWNER') {
      const school = await prisma.school.findUnique({
        where: { ownerId: user.id },
        include: { courses: true, enrollments: true, instructors: { include: { user: { select: { name: true } } } } },
      })
      detail.school = school
        ? {
            id: school.id,
            name: school.name,
            city: school.city,
            locality: school.locality,
            status: school.status,
            courseCount: school.courses.length,
            studentCount: school.enrollments.length,
            instructors: school.instructors.map((i) => ({ id: i.id, name: i.user.name })),
          }
        : null
    }

    if (user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.id },
        include: { school: { select: { id: true, name: true, city: true } } },
      })
      if (instructor) {
        const enrollments = await prisma.enrollment.findMany({
          where: { instructorId: instructor.id },
          include: { course: true, batch: true },
        })
        detail.school = instructor.school
        detail.students = enrollments.map((e) => ({
          id: e.id,
          studentName: e.studentName,
          courseName: e.course.name,
          progress: e.progress,
          status: e.status,
          batchStartDate: e.batch ? e.batch.startDate : null,
        }))
      }
    }

    res.json({ ...user, ...detail })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load user detail' })
  }
})

// GET /api/admin/schools/:id — full detail for one school (owner, instructors, students)
router.get('/schools/:id', async (req, res) => {
  try {
    const school = await prisma.school.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, photoUrl: true } },
        courses: true,
        instructors: { include: { user: { select: { id: true, name: true, email: true, photoUrl: true } } } },
        enrollments: {
          include: {
            course: true,
            instructor: { include: { user: { select: { name: true } } } },
            batch: true,
          },
        },
      },
    })
    if (!school) return res.status(404).json({ error: 'School not found' })

    res.json({
      id: school.id,
      name: school.name,
      city: school.city,
      locality: school.locality,
      status: school.status,
      rating: school.rating,
      owner: school.owner,
      courses: school.courses,
      instructors: school.instructors.map((i) => ({
        id: i.id,
        name: i.user.name,
        email: i.user.email,
        photoUrl: i.user.photoUrl,
        studentCount: school.enrollments.filter((e) => e.instructorId === i.id).length,
      })),
      students: school.enrollments.map((e) => ({
        id: e.id,
        studentName: e.studentName,
        courseName: e.course.name,
        instructorName: e.instructor ? e.instructor.user.name : 'Unassigned',
        progress: e.progress,
        status: e.status,
        batchStartDate: e.batch ? e.batch.startDate : null,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load school detail' })
  }
})

module.exports = router