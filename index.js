'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const cheerio = require('cheerio')
var request = require('request');


var today_verse;

console.log(new Date().toLocaleDateString('ar-zh'));
console.log(new Date().toLocaleDateString('zh'));
// console.log(new Date().toLocaleDateString('zh'));
//
// function doEveryDay() {
//     request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
//         console.log('error:', error); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log('body:', body); // Print the HTML for the Google homepage.
//         var str = body;
//         var n = str.indexOf("MyJSStringVar");
//         var d = str.indexOf("var div = document.getElementById('c_cont');");
//         console.log(n);
//         console.log(d);
//         var verse = str.substring( n + 16, d - 5);
//         console.log(verse);
//         today_verse = verse;
//     });
// }

request('http://www.duranno.tw/livinglife/index.php/daily', function (error, response, body) {
    // console.log('error:', error); // Print the error if one occurred
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    // console.log('body:', body); // Print the HTML for the Google homepage.
    var str = body;
    var n = str.indexOf("MyJSStringVar");
    var d = str.indexOf("var div = document.getElementById('c_cont');");
    // console.log(n);
    // console.log(d);
    var verse = str.substring( n + 16, d - 5);
    // console.log(verse);
    today_verse = verse.replace(/([";.*+^$[\]\\(){}-])/g,'');
    // console.log(today_verse);
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

  // create a echoing text message
  // const echo = { type: 'text', text: `${event.message.text}${new Date()}`  };
  const echo = { type: 'text', text: `${today_verse}  ${new Date().toLocaleDateString('zh')}`};

  console.log('client', client);

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
