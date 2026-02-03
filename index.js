
const express = require("express")
const dotEnv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const vendorRoutes = require('./routes/vendorRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const path = require('path')


const app = express()

const PORT = process.env.PORT || 4000;

dotEnv.config()

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected Sucessfully"))
    .catch((error) => console.log(error));

app.use(bodyParser.json());    
app.use('/vendor' , vendorRoutes);
app.use('/inventory' , inventoryRoutes);
app.use('/uploads' , express.static('uploads'));

app.listen(PORT , ()=>{
    console.log(`server started at ${PORT}`)
})

app.use('/home' , (req,res) => {
    res.send("<h1> Hello World")
})