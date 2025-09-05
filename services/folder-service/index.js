const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3001 ;
const connectDB = require('./config/connectDB')

app.use(cors());
connectDB();

app.get('/', (req, res) => {
  res.send('Folder Service running!')
})

app.listen(port, () => {
  console.log(`Folder service listening on port ${port}`)
})