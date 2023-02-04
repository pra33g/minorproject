/*jshint esversion: 11 */
const {sendSse} = require("./sse.js");
//route: /upload
const megaByte = 1024 * 1024 ; //bytes
const maxSize = 20 * megaByte;
//express handles the server and routing within server
const express = require('express');
//function to get a string with reason(meaning) of a http code
const httpReason = require('http-status-codes').getReasonPhrase;
//enum with http codes
const httpCode = require('http-status-codes').StatusCodes;
//handles file upload, makes file available in request
const upload = require('express-fileupload');
//
const router = express.Router();
//pdfjs to open pdf on server side
const pdfjs = require('pdfjs-dist');
const log = console.log.bind(console);

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
            pdf.name = pdf.name.replaceAll(' ','-');
            if (pdf.name.length > 25){
                pdf.name = pdf.name
                    .substring(0, 21)
                    .concat(".pdf");
            }

            if (sizeTooLarge){
                sizeTooLarge = false;
                res.json(httpObject(httpCode.REQUEST_TOO_LONG, {"message":`Max size is ${maxSize/(1024*1024)}mb`}));
            } else {
                let pagesInPDF ;
                // console.log( req.files);
                let pdfPath = __dirname+"/upload/"+pdf.name;
                pdf.mv(__dirname+"/upload/"+pdf.name, err => {
                    if (err){
                        log(err);
                        res.json(httpObject(httpCode.UNPROCESSABLE_ENTITY));
                        
                    } else {
                        //file has been saved with name pdf.name
                        ppageCountPDF(pdfPath, res, pdf.name);
                    }
                });
                 
            }

        } else {
            sendSse({"message": "Format unaccepatble"})
            res.json(httpObject(httpCode.NOT_ACCEPTABLE));
        }
        
        
    } catch (e) {
        console.log(req.body, e);
        res.json(httpCode.INTERNAL_SERVER_ERROR);
    }
});


//returns a js object format {HTTPCode: Meaning} 
//example {'404': 'Resource not found'}
function httpObject(code, additionalProp){
    let ret = {"http":code};
    ret["reason"] = httpReason(code);
    for(const prop in additionalProp){
        ret[prop] = additionalProp[prop];
    }
    return ret;
}

module.exports = router;


//a function that returns a promise when done opening a pdf file
function pageCountPDFPromise(path){
    sendSse({"message":"Opening file"})
    const loadingTask = pdfjs.getDocument(path);
    return loadingTask.promise;
}
//wrapper to call pageCountPDFPromise (async)
//example:  ppageCountPDF(__dirname+"/upload/PDFMarkRecipes.pdf");
async function ppageCountPDF(path, res, name){
    try {
        let {numPages: pages} = await pageCountPDFPromise(path);
        // let ret = httpObject(httpCode.CREATED);
        // ret["pages"] = pages;
        // ret["name"] = name;
        res.json(httpObject(httpCode.CREATED, {"pages":pages, "name":name, "message":"Successfully opened PDF"}));
        // res.json(ret);
        return pages;
    }
    catch (err) {
        console.log(err);
        let ret = httpObject(httpCode.INTERNAL_SERVER_ERROR,{"message":"PDFError check your pdf"});
        res.json(ret);
        return -1;
    }
}

