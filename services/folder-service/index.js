const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 3001 ;
const connectDB = require('./config/connectDB')
const { connectRabbitMQ } = require("./config/connectRabbitMQ");
const crudRoutes = require('./routes/crud.route')
const featureRoutes = require('./routes/feature.route')

app.use(cors());
app.use(express.json()); 
connectDB();
connectRabbitMQ();

app.use('/crud',crudRoutes);
app.use('/feature',featureRoutes);

app.get('/', (req, res) => {
  res.send('Folder Service running!')
})

app.listen(port, () => {
  console.log(`Folder service listening on port ${port}`)
})