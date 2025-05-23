const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// ID :  Pass : 

// Middleware
app.use(cors());
app.use(express.json());




// Started...
app.get('/', (req, res) => {
    res.send('Plant is getting bigger')
});

// For listen port
app.listen(port, () => {
    console.log(`Plant server is running on port ${port}`)
}); 