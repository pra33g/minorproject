/*jshint esversion: 11 */
const {sendSse} = require("./sse.js");
//route: /upload
//express handles the server and routing within server
const express = require('express');
const { application } = require("express");
//function to get a string with reason(meaning) of a http code
const httpReason = require('http-status-codes').getReasonPhrase;
//enum with http codes
const httpCode = require('http-status-codes').StatusCodes;
const fs = require('fs');
const path = require('path');
const router = express.Router();
const log = console.log.bind(console);

router.use(express.json());
router.use(express.urlencoded());

router.get("/", (req, res) => {

});

router.post("/", (req, res) => {
    sendSse({"message":"processing-file"});
    // log(req.body);
    createBmFile(req.body)
    .then(() => {
        //call gs with filename
        callPdfBM(req.body.name);
        let convertedName = req.body.name.substring(0,21).concat("-converted.pdf");
        sendSse({"message":"conversion-done", "name":convertedName});

    })
    .catch(err=>{
        log(err);
    });
    res.json(httpObject(httpCode.CREATED));
});
async function createBmFile(oobj){
    let obj = oobj.data;
    let pdfname = oobj.name;
    let bmText ="";
    let tab = "\t";
    let newLine = "\n";
    let space = " ";
    obj.forEach(element => {
        bmText += tab.repeat(element.tabs) 
            + element.pno 
            + space
            + element.title
            + newLine;
    });
    let bmPath = path.join(__dirname, "pdfbm", "bookmarks.file");
    fs.writeFileSync(
        bmPath, 
        bmText,
        {
            encoding: "utf8",
            flag: "w",
            mode: 0o666,
        });
    // log(pdfname)
}
function httpObject(code, additionalProp){
    let ret = {"http":code};
    ret["reason"] = httpReason(code);
    for(const prop in additionalProp){
        ret[prop] = additionalProp[prop];
    }
    return ret;
}
const execSync = require('child_process').execSync;
async function callPdfBM(ifname){
    //detect os
    if (process.platform === "win32"){
        log("exec win32 script");
        let ofname = ifname.substring(0,21).concat("-converted.pdf");
        // log(__dirname)
        // execSync('cd', { cwd: path.join(__dirname) });
        let command = `execPdf.bat ${ifname} ${ofname}`;
        execSync(command,
            {
                cwd: __dirname,
                stdio: 'inherit'
            });
        return ofname;

    } else if (process.platform === "linux"){
        log("exec linux script");
    }
}

module.exports = router;