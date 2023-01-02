/*jshint esversion: 6 */

//init app
const express = require('express');
const upload = require('express-fileupload');
const cors = require('cors');
const app = express();
const port = 5000;
//misc
const log = console.log.bind(console);
//routes
const routerBookmark = require('./routes/bookmark');
const routerBookmarkUpdates = require('./routes/bookmarkStatus').router;
const preview = require('./routes/preview');
//start app
app.listen(port, ()=>console.log("ExpressServerPort " + port));

//log requests
app.use(express.json());
app.use(express.urlencoded());
app.use("/", (req, res, next)=>{
    log(req.method, req.url, req.body);
    next();
});
//cors enabled 
app.use(cors());
//routes
app.use("/bookmarkStatus", routerBookmarkUpdates);
app.use("/bookmark", routerBookmark);
app.use("/preview", preview);
// app.use("/preview", express.static(__dirname+"/upload/ll.html"));

//set homepage
app.use(express.static(__dirname+"/public"));

/*app routes*/
app.post("/", (req, res)=>{
    
    res.sendStatus(201);
});