const express = require('express')
const prisma = require('../prisma/client')
const { requireAuth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.post('/', requireAuth, requireRole('LEARNER'), async (req, res) => {
  try {
    const { slotId } = req.body
    if (!slotId) return res.status(400).json({ error: 'slotId is required' })

    const slot = await prisma.lessonSlot.findUnique({
      where: { id: Number(slotId) },
      include: { course: true },
    })

    if (!slot) return res.status(404).json({ error: 'Slot not found' })
    if (slot.isBooked) return res.status(409).json({ error: 'This slot is already booked' })

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })

    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.enrollment.create({
        data: {
          studentName: user.name,
          progress: 0,
          status: 'ACTIVE',
          schoolId: slot.course.schoolId,
          courseId: slot.course.id,
          userId: user.id,
          slotId: slot.id,
          instructorId: slot.instructorId,
        },
      })
      await tx.lessonSlot.update({ where: { id: slot.id }, data: { isBooked: true } })
      return created
    })

    res.status(201).json(enrollment)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Booking failed' })
  }
})

module.exports = router