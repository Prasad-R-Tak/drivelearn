const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.post('/', requireAuth, requireRole('LEARNER'), async (req, res) => {
  try {
    const { batchId } = req.body
    if (!batchId) return res.status(400).json({ error: 'batchId is required' })

    const batch = await prisma.batch.findUnique({ where: { id: Number(batchId) }, include: { course: true } })
    if (!batch) return res.status(404).json({ error: 'Batch not found' })
    if (batch.isBooked) return res.status(409).json({ error: 'This batch is already booked' })

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })

    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.enrollment.create({
        data: {
          studentName: user.name,
          progress: 0,
          status: 'ACTIVE',
          schoolId: batch.course.schoolId,
          courseId: batch.course.id,
          userId: user.id,
          batchId: batch.id,
          instructorId: batch.instructorId,
        },
      })
      await tx.batch.update({ where: { id: batch.id }, data: { isBooked: true } })
      return created
    })

    res.status(201).json(enrollment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Booking failed' })
  }
})

module.exports = router