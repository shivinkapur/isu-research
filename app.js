const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const { pp } = require('./config');

const { cid, secret, partnerId } = pp;

let ppdata = {};
const ppUrl = 'https://api.sandbox.paypal.com/v1';
const tid = Date.now(); // Tracking id can be completely random, should be uuid

// Logging
const log = (d )=> {
  console.log('LOGGING', d);
  if(typeof d === 'string') d = JSON.parse(d);
  console.log( JSON.stringify(d, null, 2) );
};

// Helper function to send post request and error handling
const post = (url, data, cb) => {
  request.post(`${ppUrl}${url}`, data, (err, res, body) => {
    if (err) 
      return console.log('error', err);
    const result = typeof body === 'string' ? JSON.parse(body) : body;
    cb( result );
  });
};

// When app starts, get an oauth token
post('/oauth2/token', {
  form: {
    grant_type: 'client_credentials' 
  },
  auth: {
    user: cid,
    pass: secret
  },
}, (body) => {
  ppdata = body;
});

// Express - server routing
const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req,res) => {
  res.send('Hello. Please visit /isu.html');
});

// Privacy policy url and user agreements
app.get('/merchant/ppurl', (req,res) => {
  res.send('SONG ZHENG HAS AMAZING privacy policy');
});
app.get('/merchant/uaurl', (req,res) => {
  res.send('SONG ZHENG HAS AMAZING USER AGREEMENT');
});


// Client will be hitting this url to create a referral url for isu
app.post('/merchant/referrals', (req,res) => {
  post('/customer/partner-referrals', {
    headers: {
      Authorization: `Bearer ${ppdata.access_token}`
    },
    json: {
      customer_data: {
        customer_type: 'MERCHANT',
        person_details: {
          email_address: 'mc@garagescript.org',
        },
      partner_specific_identifiers: [
        {
          type: 'TRACKING_ID',
          value: tid
        }
      ],
      },
      requested_capabilities: [{
        capability: 'API_INTEGRATION',
        api_integration_preference: {
          "partner_id": partnerId,
          "rest_api_integration": {
            "integration_method": "PAYPAL",
            "integration_type": "THIRD_PARTY"
          },
          "rest_third_party_details": {
            "partner_client_id": cid,
            "feature_list": [
              'ADVANCED_TRANSACTIONS_SEARCH',
            ]
          }
        },
      }],
      web_experience_preference: {
        partner_logo_url: 'https://pbs.twimg.com/profile_images/960328536606191616/M_8xKwuC_400x400.jpg',
        return_url: 'https://ppm.songz.me/merchant/return'
      }
    }
  }, (body) => {
    res.json(body);
  });
});

// User is returned here after ISU flow
app.get('/merchant/return', (req,res) => {
  // Get merchant information (like target cid)
  request.get(`${ppUrl}/customer/partners/${partnerId}/merchant-integrations/${req.query.merchantIdInPayPal}`, {
    headers: {
      Authorization: `Bearer ${ppdata.access_token}`
    },
  }, (err, rez, body) => {
    const result = (typeof body === 'string') ? JSON.parse(body) : body;
    res.json(result);
  });
});

app.listen(3612); // ppm.songz.me

