const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('INSTRUCTOR'))

// GET /api/instructor/dashboard — assigned students for this instructor
router.get('/dashboard', async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.user.userId },
      include: { school: true },
    })
    if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' })

    const enrollments = await prisma.enrollment.findMany({
      where: { instructorId: instructor.id },
      include: { course: true, slot: true },
      orderBy: { id: 'desc' },
    })

    const students = enrollments.map((e) => ({
      id: e.id,
      studentName: e.studentName,
      course: e.course.name,
      progress: e.progress,
      status: e.status === 'COMPLETED' ? 'Completed' : 'Active',
      slotDateTime: e.slot ? e.slot.dateTime : null,
    }))

    res.json({ school: { id: instructor.school.id, name: instructor.school.name }, students })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// PATCH /api/instructor/students/:enrollmentId/progress
router.patch('/students/:enrollmentId/progress', async (req, res) => {
  try {
    const { progress } = req.body
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'progress must be between 0 and 100' })
    }

    const instructor = await prisma.instructor.findUnique({ where: { userId: req.user.userId } })
    if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' })

    const enrollment = await prisma.enrollment.findFirst({
      where: { id: Number(req.params.enrollmentId), instructorId: instructor.id },
    })
    if (!enrollment) return res.status(404).json({ error: 'Student not found under your instruction' })

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress: Number(progress), status: Number(progress) >= 100 ? 'COMPLETED' : 'ACTIVE' },
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})

module.exports = router