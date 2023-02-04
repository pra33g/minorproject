/*jshint esversion: 8 */
const {sendSse} = require('./sse.js');
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
const log = console.log.bind(console);
const router = express.Router();

router.get("/", (req, res) => {
    // sendSse({"message":`pages`})
    let pdfname = req.query.name;
    let path = __dirname+"/upload/"+pdfname;
    res.sendFile(path);
});


module.exports = router;

