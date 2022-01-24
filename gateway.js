// Load express
const express = require('express');
const helmet = require('helmet');
const path = require("path");
const cors = require('cors');
const app = express();

// Load .env
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// app.use(express.static(path.join(__dirname, "ui", "build")));

// app.use('/ui', (req, res, next) => {
//     res.sendFile(path.join(__dirname, "ui", "build", "index.html"));
// });

// Apply middlewares
// Enable CORS
app.use(cors());
app.use(express.json());
app.use(helmet());

// Load routes
const routes = require('./routes');
app.get('/test', (req, res) => {
    res.send("Gateway is running.")
})

app.use('/api', routes)

app.all('/*', (req, res) => {
    res.status(400).send('not found')
})

app.listen(PORT, () => {
    console.log(`Gateway listening on ${PORT}`);
});
