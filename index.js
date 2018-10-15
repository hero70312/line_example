'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const cheerio = require('cheerio')
const request = require('request');
const randomInt = require('random-int');

const keywords = {
    qt: '我要QT',
    song: '來一首詩歌',
    good: '給予肯定',
    verse: '來一句經文',
    wait: '尚未開放',
    greeting_morning: '早',
    greeting_goodmorning: '早安',
    greeting_goodnight: '晚安',
    greeting_hi: 'hi',
    greeting_Hi: 'Hi',
    greeting_hi_chinese: '嗨',
}

const youtubeLinks = [
    'https://www.youtube.com/watch?v=E7i6c54KEfc&ab_channel=HillsongWorship',
    'https://www.youtube.com/watch?v=pIf6j-WeyFw&ab_channel=HillsongWorship',
    'https://www.youtube.com/watch?v=rW9MbYQrTUI&ab_channel=HillsongWorship',
    'https://www.youtube.com/watch?v=Q7JsK50NGaA&list=RDrW9MbYQrTUI&index=4&ab_channel=HillsongWorship',
]

const church_link = 'http://www.changelife.org.tw/sermonsMorningDevotions.php';

const share = '牧師分享：'

const reply = {
    thanks: '謝謝你的鼓勵',
    sorry: '很抱歉，功能尚未開放',
    useless: '很抱歉，我不知道你想要什麼',
    greeting: 'Hi, 很高興認識你',
}

let a = '\u2764';

var book_code = '1F4D6;';
var mic_code = '1F399;';
let book = String.fromCodePoint(parseInt(book_code, 16));
let mic = String.fromCodePoint(parseInt(mic_code, 16));

var today_range;
var today_verse;

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
        console.log(a);
    });
}

updateVerse();

let time = 1000 * 60 * 60;

setInterval(updateVerse, time);


request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    const $ = cheerio.load(body);

    let str = body;
    let n = str.indexOf("MyJSStringVar");
    let d = str.indexOf("var div = document.getElementById('c_cont');");
    // console.log(n);
    // console.log(d);
    let verse = str.substring(n + 16, d - 5);
    // console.log(verse);
    today_verse = verse.replace(/([";.*+^$[\]\\(){}-])/g, '');
    today_range = $('.range').text().replace(/ /g, '');
    today_range = today_range.replace(/\n/g, '');
});

const config = {
    channelAccessToken: 'gOMQj8Pnd70xqcnXf8vLXngiGiDjTYRD/E4yVVGFKNdw7NuTL8r5e5PE52OoopXW+AXo3ikuiAOZlbhX0Ho3jB3V6OjN17XwpNrvcwV9xZvAINwrSTXFXYL0j02ri6eABydyMDuqxub4b3GUCshcBQdB04t89/1O/w1cDnyilFU=',
    channelSecret: '240565389320d52d465935a8d45759f3',
};

const client = new line.Client(config);

const app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.post('/callback', line.middleware(config), (req, res) => {
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
        case keywords.qt:
            echo = {type: 'text', text: `${new Date().toLocaleDateString('zh')}\n${today_range}\n${book}${today_verse}\n${mic}${share}\n\n${church_link}`};
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
