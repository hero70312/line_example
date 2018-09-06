'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const cheerio = require('cheerio')
const request = require('request');


const keywords = {
    qt:'我要QT',
    song:'來一首詩歌',
    good:'給予肯定',
    verse:'來一句經文',
    wait:'尚未開放',
}

const reply = {
    thanks:'謝謝你的鼓勵',
    sorry:'很抱歉，功能尚未開放',
    useless:'很抱歉，我不知道你想要什麼',
}


var today_range;
var today_verse;


const updateVerse = function () {
    request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
        // console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        // console.log('body:', body); // Print the HTML for the Google homepage.
        const $ = cheerio.load(body);
        // console.log();

        var str = body;
        var n = str.indexOf("MyJSStringVar");
        var d = str.indexOf("var div = document.getElementById('c_cont');");
        // console.log(n);
        // console.log(d);
        var verse = str.substring( n + 16, d - 5);
        // console.log(verse);
        today_verse = verse.replace(/([";.*+^$[\]\\(){}-])/g,'');
        today_range = $('.range').text().replace(/ /g,'');
        today_range = today_range.replace(/\n/g,'');
        // console.log(today_verse);
        let a = `${today_range}\n${today_verse}\n${new Date().toLocaleDateString('zh')}`
        console.log(a);
    });
}

let time = 1000*60*60;


setInterval(updateVerse, time);


request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    const $ = cheerio.load(body);
    // console.log();

    var str = body;
    var n = str.indexOf("MyJSStringVar");
    var d = str.indexOf("var div = document.getElementById('c_cont');");
    // console.log(n);
    // console.log(d);
    var verse = str.substring( n + 16, d - 5);
    // console.log(verse);
    today_verse = verse.replace(/([";.*+^$[\]\\(){}-])/g,'');
    today_range = $('.range').text().replace(/ /g,'');
    today_range = today_range.replace(/\n/g,'');
    // console.log(today_verse);
    let a = `${today_range}\n${today_verse}\n${new Date().toLocaleDateString('zh')}`
    console.log(a);
});



// create LINE SDK config from env variables
const config = {
  channelAccessToken: 'gOMQj8Pnd70xqcnXf8vLXngiGiDjTYRD/E4yVVGFKNdw7NuTL8r5e5PE52OoopXW+AXo3ikuiAOZlbhX0Ho3jB3V6OjN17XwpNrvcwV9xZvAINwrSTXFXYL0j02ri6eABydyMDuqxub4b3GUCshcBQdB04t89/1O/w1cDnyilFU=',
  channelSecret: '240565389320d52d465935a8d45759f3',
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please re

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

    switch (event.message.text){
      case keywords.qt:
          echo = { type: 'text', text: `${today_range}\n${today_verse}\n${new Date().toLocaleDateString('zh')}`};
          break;
      case keywords.good:
          echo = { type: 'text', text: `${reply.thanks}`};
          break;
      case keywords.wait:
          echo = { type: 'text', text: `${reply.sorry}`};
          break;
      default:
          echo = { type: 'text', text: `${reply.useless}`};
          break;
  }
  // const echo = { type: 'text', text: `${event.message.text}${new Date()}`  };
  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
