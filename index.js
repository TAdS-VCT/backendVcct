const connectToMongo = require('./db.js');
const express = require('express');
const app = express();
const cors = require('cors')
connectToMongo();

app.use(express.json());
app.use(cors())

const port = 8000;


app.use('/user', require('./routes/tads_user.js'));
app.use('/riddle', require('./routes/tads_riddles.js'));



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})