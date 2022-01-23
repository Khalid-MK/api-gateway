// Load express
const express = require('express');
const helmet = require('helmet');
const app = express();

// Load .env
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// Apply middlewares
app.use(express.json());
app.use(helmet());

// Load routes
const routes = require('./routes');
app.use('/', routes)

app.listen(PORT, () => {
    console.log(`Gateway listening on ${PORT}`);
});
