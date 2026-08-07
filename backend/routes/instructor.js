const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.use(requireAuth, requireRole('INSTRUCTOR'))

router.get('/dashboard', async (req, res) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: req.user.userId },
      include: { school: true },
    })
    if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' })

    const enrollments = await prisma.enrollment.findMany({
      where: { instructorId: instructor.id },
      include: {
        course: true,
        batch: { include: { lessonDays: { orderBy: { date: 'asc' } } } },
      },
      orderBy: { id: 'desc' },
    })

    const students = enrollments.map((e) => ({
      id: e.id,
      studentName: e.studentName,
      course: e.course.name,
      progress: e.progress,
      status: e.status === 'COMPLETED' ? 'Completed' : 'Active',
      totalLessons: e.batch?.totalLessons || 0,
      lessonDays: e.batch?.lessonDays.map((ld) => ({ id: ld.id, date: ld.date, attended: ld.attended })) || [],
    }))

    res.json({ school: { id: instructor.school.id, name: instructor.school.name }, students })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

// PATCH /api/instructor/lesson-days/:id/attendance — toggle a specific day, progress recomputed from attended count
router.patch('/lesson-days/:id/attendance', async (req, res) => {
  try {
    const { attended } = req.body
    if (typeof attended !== 'boolean') return res.status(400).json({ error: 'attended must be true or false' })

    const instructor = await prisma.instructor.findUnique({ where: { userId: req.user.userId } })
    if (!instructor) return res.status(404).json({ error: 'Instructor profile not found' })

    const lessonDay = await prisma.lessonDay.findUnique({
      where: { id: Number(req.params.id) },
      include: { batch: { include: { enrollment: true } } },
    })
    if (!lessonDay || lessonDay.batch.instructorId !== instructor.id) {
      return res.status(404).json({ error: 'Lesson not found under your instruction' })
    }

    await prisma.lessonDay.update({ where: { id: lessonDay.id }, data: { attended } })

    const allDays = await prisma.lessonDay.findMany({ where: { batchId: lessonDay.batchId } })
    const attendedCount = allDays.filter((d) => d.attended).length
    const progress = Math.round((attendedCount / lessonDay.batch.totalLessons) * 100)

    if (lessonDay.batch.enrollment) {
      await prisma.enrollment.update({
        where: { id: lessonDay.batch.enrollment.id },
        data: { progress, status: progress >= 100 ? 'COMPLETED' : 'ACTIVE' },
      })
    }

    res.json({ message: 'Attendance updated', progress })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update attendance' })
  }
})

module.exports = router