/*jshint esversion: 8 */

const express = require('express');
//fs to get system filesystem access
const fs = require('fs');
//function to get a string with reason(meaning) of a http code
const httpReason = require('http-status-codes').getReasonPhrase;
//enum with http codes
const httpCode = require('http-status-codes').StatusCodes;
//handles file upload, makes file available in request
const upload = require('express-fileupload');
//
const router = express.Router();

const log = console.log.bind(console);

router.get("/", async function (req, res){

    console.log(`${req.method} /bookmark/bookmarkStatus`);
    res.set({
        "Cache-Control" : "no-cache",
        "Content-Type" : "text/event-stream",
        "Connection" : "keep-alive",
    });
    res.flushHeaders();
    res.write("retry: 1000\n\n");
    console.log("Emitted message");
    //emit sse
    const json = {"sample":"sample"};
    res.write(`data: `+JSON.stringify(json) +"\n\n");
    // foo(res);
});



module.exports = router;
