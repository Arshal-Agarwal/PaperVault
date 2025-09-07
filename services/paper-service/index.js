const express = require('express')
const cors = require('cors')
const connectDB = require('./config/connectDB')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3002
const crudRoutes = require('./routes/crud.route')

connectDB();
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form-data urlencoded fields
app.use(cors())

app.use('/crud',crudRoutes)

app.get('/', (req, res) => {
  res.send('Paper Service is running!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})