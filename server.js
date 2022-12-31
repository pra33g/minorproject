/*jshint esversion: 6 */

//init app
const express = require('express');
const upload = require('express-fileupload');
const app = express();
const routerBookmark = require('./routes/bookmark');
const routerBookmarkUpdates = require('./routes/bookmarkStatus');
const port = 5000;
const log = console.log.bind(console);

app.listen(port, ()=>console.log("ExpressServerPort " + port));

//log requests
app.use(express.json());
app.use(express.urlencoded());
app.use("/", (req, res, next)=>{
    log(req.method, req.url, req.body);
    next();
});
app.use("/bookmark/bookmarkStatus", routerBookmarkUpdates);
app.use("/bookmark", routerBookmark);


//set homepage
app.use(express.static(__dirname+"/public"));

/*app routes*/
app.post("/", (req, res)=>{
    
    res.sendStatus(201);
});