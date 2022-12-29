/*jshint esversion: 8 */
//routes of url/bookmark
const maxSize = 1024 * 1024;
const mbSize = 1024 * 1024 ;
const express = require('express');
const fs = require('fs');
const upload = require('express-fileupload');
const router = express.Router();
router.use(upload({
    createParentPath: true,
    preserveExtension: true,
    limits: {fileSize: maxSize},
    abortOnLimit: true,
    limitHandler: function(req, res, next){
        console.log("Too big");
        sizeTooLarge = true;
    },
}));
router.get("/", (req, res)=>{
    // res.status(200).json({mssg:"Welcome"});
    res.status(200);
});
//upload bm file
let uploads = 1;

let sizeTooLarge = false;
router.post("/", async (req, res) => { 
    try{
        if (req.files && req.files.pdfbm_upload.mimetype==='application/pdf'){
            const pdf = req.files.pdfbm_upload;
            const origName = pdf.name;
            pdf.name = pdf.name.replace(' ','-');
            if (sizeTooLarge){
                sizeTooLarge = false;
                res.json({"http":"413"});
            } else {
                console.log('success upload ' + pdf.name);
                pdf.mv(__dirname+"/upload/"+pdf.name);
                res.json({"http":"201"});
            }
            // res.json({"response":"ok"});
            //file has been saved with name pdf.name

        } else {
            console.log('invalid mime');
            res.json({"response":"invalid mime [pdf]"});

        }
        
        
    } catch (e) {
        console.log(req.body, e, "\n\nXXX\n\n");
        res.sendStatus(500);
    }    
});

module.exports = router;

function checkFileExists(path){
    let ret;
    fs.access(path, fs.constants.F_OK,(err)=>{
        if(err){
            console.log("not exist, created");
            uploads++;
            ret = false;
        } else {
            console.log("exists, upload++", uploads);
            uploads++;
            ret = true;
        }
    });
    return ret;
}