/*jshint esversion: 6 */

//init app
const express = require('express');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const app = express();
const port = 5000;
//misc
const log = console.log.bind(console);
//routes
const upload = require('./routes/upload');
const add = require('./routes/add');
const sse = require('./routes/sse').router;
const download = require('./routes/preview');
//start app
app.listen(port, ()=>console.log("http://localhost:" + port));


//app routes
/*

[root]/
    upload
    download
    bookmark
        add

*/



//log requests
app.use(express.json());
app.use(express.urlencoded());
app.use("/", (req, res, next)=>{
    log(req.method, req.url, req.body);
    next();
});
//cors enabled 
app.use(cors());
//favicon
app.use(favicon(path.join(__dirname,"public","favicon","favicon.ico")));
//routes
app.use("/sse", sse);
app.use("/add", add);
app.use("/upload", upload);
app.use("/download", download);
app.use("/preview", express.static(__dirname+"/upload/"));

//set homepage
app.use(express.static(__dirname+"/public"));


/*app routes*/
app.post("/", (req, res)=>{
    
    res.sendStatus(201);
});
