const express = require('express')
const cors = require('cors')
require('dotenv').config()

const schoolsRouter = require('./routes/schools')
const authRouter = require('./routes/auth')
const ownerRouter = require('./routes/owner')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' })
})

app.use('/api/schools', schoolsRouter)
app.use('/api/auth', authRouter)
app.use('/api/owner', ownerRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))