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
const router = express.Router();
const log = console.log.bind(console);

router.use(express.json());
router.use(express.urlencoded());

router.get("/", (req, res) => {

});

router.post("/", (req, res) => {

});


module.exports = router;