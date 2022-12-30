/*jshint esversion: 8 */
//route: /bookmark
const megaByte = 1024 * 1024 ; //bytes
const maxSize = 10 * megaByte;
//express handles the server and routing within server
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




//middleware to handle upload, some flags have been set
let sizeTooLarge = false;

router.use(upload({
    //path to file created, if not exist
    createParentPath: true,
    //filename preserver
    preserveExtension: true,
    //limits to filesize impsosed
    limits: {fileSize: maxSize},
    //transfer (client ->server) aborted if limit met
    abortOnLimit: true,
    //function invoked when limit is met
    limitHandler: function(req, res, next){
        sizeTooLarge = true;
    },
}));


//handle get requests to /bookmark
router.get("/", (req, res)=>{
    
    // res.redirect(httpCode.PERMANENT_REDIRECT, __dirname);
    res.json(httpObject(httpCode.OK));
});


router.post("/", async (req, res) => { 
    try{
        if (req.files && req.files.pdfbm_upload.mimetype==='application/pdf'){
            const pdf = req.files.pdfbm_upload;
            const origName = pdf.name;
            pdf.name = pdf.name.replace(' ','-');
            if (sizeTooLarge){
                sizeTooLarge = false;
                res.json(httpObject(httpCode.REQUEST_TOO_LONG));
            } else {
                console.log('success upload ' + pdf.name);
                pdf.mv(__dirname+"/upload/"+pdf.name);
                //file has been saved with name pdf.name
                res.json(httpObject(httpCode.CREATED));
            }

        } else {
            res.json(httpObject(httpCode.NOT_ACCEPTABLE));
        }
        
        
    } catch (e) {
        console.log(req.body, e);
        res.json(httpCode.INTERNAL_SERVER_ERROR);
    }    
});


//returns a js object format {HTTPCode: Meaning} 
//example {'404': 'Resource not found'}
function httpObject(code){
    return {[code]:httpReason(code)};
}

module.exports = router;