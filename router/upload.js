'use strict';

const router = require('express').Router();
const GoogleDriveService = require("../service/googleDrive");
const errorWrapper = require('../utils/errorWrapper');
//
router.get('/', async (req, res) => {
    res.redirect('/index.html');
});

router.post('/', errorWrapper(async (req, res) => {

    const {userName, audioFileBase64, audioFileFileName, fileFormat, songName} = req.body;


    const {sharedUrl: url} = await new GoogleDriveService().uploadFile({
        fileName: audioFileFileName,
        fileBase64: audioFileBase64,
        userName: userName,
        fileFormat,
        songName
    });


    res.json({url});

}));

module.exports = router;
