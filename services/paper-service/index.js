const express = require("express");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const { connectRabbitMQ } = require("./config/connectRabbitMQ");
const startFolderConsumer = require("./consumers/folderConsumer");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3002;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
const crudRoutes = require("./routes/crud.route");
app.use("/crud", crudRoutes);

app.get("/", (req, res) => {
  res.send("📄 Paper Service is running!");
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 Paper Service listening on port ${port}`);

  // ✅ Connect RabbitMQ + Start Consumers
  await connectRabbitMQ();
  startFolderConsumer();
});
