/*jshint esversion: 6 */

//init app
const express = require('express');
const upload = require('express-fileupload');
const app = express();
const router = require('./routes/bookmark');
const port = 5000;
app.listen(port, ()=>console.log("Express Port " + port));

//log requests
app.use(express.json());
app.use(express.urlencoded());
app.use("/", (req, res, next)=>{
    console.log(req.method, req.url, req.body);
    next();
});
app.use("/bookmark", router);


//set homepage
app.use(express.static(__dirname+"/public"));

/*app routes*/
app.post("/", (req, res)=>{
    
    res.sendStatus(201);
});