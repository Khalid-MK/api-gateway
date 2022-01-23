const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());
app.get(`/fakeapi`, (req, res) => {
    res.send("Fake api server response")
})

app.post(`/bogusapi`, (req, res) => {
    res.send("bogusapi server response")
})

app.listen(PORT, (req, res) => {
    console.log(`Fake api server listening on port ${PORT}`)
})