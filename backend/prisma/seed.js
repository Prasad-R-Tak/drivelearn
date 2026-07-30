require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const bcrypt = require('bcryptjs')

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  const owner1 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'rajesh@highwayheroes.com',
      password: passwordHash,
      role: 'OWNER',
    },
  })

  const school1 = await prisma.school.create({
    data: {
      name: 'Highway Heroes Driving School',
      city: 'Pune',
      locality: 'Kothrud',
      rating: 4.6,
      reviews: 128,
      ownerId: owner1.id,
      courses: {
        create: [
          { name: '2-Wheeler Basic', duration: '10 lessons', price: 2500 },
          { name: '4-Wheeler Standard', duration: '20 lessons', price: 3500 },
        ],
      },
    },
    include: { courses: true },
  })

  await prisma.enrollment.createMany({
    data: [
      { studentName: 'Rohan Mehta', progress: 80, status: 'ACTIVE', schoolId: school1.id, courseId: school1.courses[1].id },
      { studentName: 'Ananya Iyer', progress: 45, status: 'ACTIVE', schoolId: school1.id, courseId: school1.courses[0].id },
      { studentName: 'Karan Shah', progress: 100, status: 'COMPLETED', schoolId: school1.id, courseId: school1.courses[1].id },
    ],
  })

  const owner2 = await prisma.user.create({
    data: {
      name: 'Meera Patel',
      email: 'meera@greensignal.com',
      password: passwordHash,
      role: 'OWNER',
    },
  })

  await prisma.school.create({
    data: {
      name: 'Green Signal Driving Academy',
      city: 'Mumbai',
      locality: 'Andheri',
      rating: 4.3,
      reviews: 210,
      ownerId: owner2.id,
      courses: {
        create: [
          { name: '4-Wheeler Standard', duration: '20 lessons', price: 5000 },
          { name: 'Commercial License Prep', duration: '30 lessons', price: 8000 },
        ],
      },
    },
  })

  console.log('Seed data created successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })