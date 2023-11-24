const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('Dream Prime Estate Server Is Running')
})

app.listen(port, (req,res)=>{
    console.log(`Dream Prime Estate is Running on Port ${port}`)
})