'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const cheerio = require('cheerio')
const request = require('request');
const randomInt = require('random-int');
const bodyParser = require('body-parser');
const Config = require("./constants/constant");
var moment = require('moment');
const urlExists = require("url-exists");
const {youtubeLinks, keywords, reply, church_link} = require("./constants/property");

const app = express();

const share = '牧師分享：';

let a = '\u2764';

var book_code = '1F4D6;';
var mic_code = '1F399;';
let book = String.fromCodePoint(parseInt(book_code, 16));
let mic = String.fromCodePoint(parseInt(mic_code, 16));
let serve_list = 'https://goo.gl/pJYa7k';

var today_range;
var today_verse;

let global_exist;
let specific_url;

const updateTodayURL = function (url) {
    urlExists(url, function(err, exists) {
        global_exist = exists;

        let audioFilePath = "http://www.changelife.org.tw/data/files/morning_bible_study/"

        let today_str =  moment().format("YYYYMMDD");

        specific_url = exists ?  audioFilePath + today_str + '.mp3' : "";

        console.log(specific_url);
    });
}

const updateVerse = function () {
    request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        const $ = cheerio.load(body);
        console.log();

        var str = body;
        var n = str.indexOf("MyJSStringVar");
        var d = str.indexOf("var div = document.getElementById('c_cont');");
        // console.log(n);
        // console.log(d);
        var verse = str.substring(n + 16, d - 5);
        // console.log(verse);
        today_verse = verse.replace(/([";.*+^$[\]\\(){}-])/g, '');
        today_range = $('.range').text().replace(/ /g, '');
        today_range = today_range.replace(/\n/g, '');
        // console.log(today_verse);
        let a = `${today_range}\n${today_verse}\n${new Date().toLocaleDateString('zh')}`
    });
}

updateVerse();
updateTodayURL();

let time = 1000 * 60 * 60;

setInterval(updateVerse, time);
setInterval(updateTodayURL, time);

const client = new line.Client(Config.line);


// // HTTP:413 Request Entity Too Large. => 要確認 express request 預設的最大上限 , 目前設定 100mb
// app.use(bodyParser.json({limit: '100mb'}));

// allow CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,locale");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

app.use('/upload', require('./router/upload'));

app.post('/callback', line.middleware(Config.line), (req, res) => {
    console.log('req', req)
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {

    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    let echo;

    switch (event.message.text) {
        case keywords.serve:
            echo = {type: 'text', text: `${serve_list}`};
            break;
        case keywords.qt:
            echo = {type: 'text', text: `${new Date().toLocaleDateString('zh')}\n${book}${today_range}\n\n${today_verse}\n\n${mic}${share}\n${church_link}\n${specific_url}`};
            break;
        case keywords.song:
            echo = {type: 'text', text: `${youtubeLinks[randomInt(0,youtubeLinks.length-1)]}`};
            break;
        case keywords.good:
            echo = {type: 'text', text: `${reply.thanks}`};
            break;
        case keywords.wait:
            echo = {type: 'text', text: `${reply.sorry}`};
            break;
        case keywords.greeting_morning:
        case keywords.greeting_goodmorning:
        case keywords.greeting_goodnight:
        case keywords.greeting_hi:
        case keywords.greeting_Hi:
        case keywords.greeting_hi_chinese:
            echo = {type: 'text', text: `${event.message.text}`};
            break;
        default:
            return;
            // echo = {type: 'text', text: `${reply.useless}`};
            break;
    }

    return client.replyMessage(event.replyToken, echo);
}

// set public folder as site root
// app.use(express.static('public'));

const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`listening on ${port}`);
});
