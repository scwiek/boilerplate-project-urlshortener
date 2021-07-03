require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const urlencodedParser = bodyParser.urlencoded({extended: false});

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', urlencodedParser, function (req, res) {
  let enteredVal = req.body.url;
  const re = /^(https?\:\/\/(www.|))/;
  if (re.test(enteredVal)) {
    const reTwo = /^(https?\:\/\/)/;
    let enteredValTrim = enteredVal.replace(reTwo, "");
    const trailSlash = /(.*)\//;
    let dnsSearch = enteredValTrim.match(trailSlash)[1];
    // console.log(dnsSearch);
    dns.lookup(dnsSearch, (err, addresses) => {
      console.log('addresses: %j error: %s', addresses, err);
      if (!err) {
        let short = Math.floor(Math.random()*99) + 1;
        app.set('shortUrl', short);
        app.set('fullUrl', enteredVal);
        res.json({
          original_url: enteredVal,
          short_url: short
        });
      } else {
        res.json({
          error: 'Invalid URL'
        });
      }
    })
  } else {
    res.json({
      error: 'Invalid URL'
    });
  }
})

app.get('/api/shorturl/:id', function (req, res) {
  let shortUrl = app.get('shortUrl');
  let reqId = +req.params.id;
  if (reqId === shortUrl) {
    let fullUrl = app.get('fullUrl');
    res.redirect(fullUrl);
  } else {
    res.json({
      error: 'Invalid shortlink'
    });
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
