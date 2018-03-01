const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

let ppdata = {};
const ppUrl = 'https://api.sandbox.paypal.com/v1';
const tid = Date.now();


const cid =  '';
const secret = '';
/* shivin's credentials 
*/


const log = (d )=> {
  console.log('LOGGING', d);
  if(typeof d === 'string') d = JSON.parse(d);
  console.log( JSON.stringify(d, null, 2) );
};

const post = (url, data, cb) => {
  request.post(`${ppUrl}${url}`, data, (err, res, body) => {
    if (err) 
      return console.log('error', err);
    const result = typeof body === 'string' ? JSON.parse(body) : body;
    cb( result );
  });
};

post('/oauth2/token', {
  form: {
    grant_type: 'client_credentials' 
  },
  //auth: `${cid}:${secret}`
  auth: {
    user: cid,
    pass: secret
  },
}, (body) => {
  ppdata = body;
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req,res) => {
  res.send('HELLO');
});

app.get('/merchant/ppurl', (req,res) => {
  res.send('SONG ZHENG HAS AMAZING privacy policy');
});

app.post('/merchant/referrals', (req,res) => {
  console.log('TRACKING_ID', tid);
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
          "partner_id": "",
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

app.get('/merchant/lippauth', (req,res) => {
  console.log(req.body);
  res.send('SONG ZHENG HAS AMAZING USER AGREEMENT');
});

app.get('/merchant/uaurl', (req,res) => {
  res.send('SONG ZHENG HAS AMAZING USER AGREEMENT');
});

app.get('/merchant/return', (req,res) => {
  request.get(`${ppUrl}/customer/partners/${''}/merchant-integrations/${req.query.merchantIdInPayPal}`, {
    headers: {
      Authorization: `Bearer ${ppdata.access_token}`
    },
  }, (err, rez, body) => {
    res.json(body);
  });
});

app.get('/*', (req, res) => {
  res.send('CwEUKppWGgO-dNi3zatsySfibhZaf2r_ZhH_D4tTojU.JW34t1osxuE7-sginY5dD-jFlVfyYe1WfM9dpkegXeU');
});
app.post('/merchant/pphook', (req, res) => {
  res.send('success');
});
app.get('/merchant/oauth', (req, res) => {
  console.log('merchant oauth');
  log(req.query);
  res.send('success');
});
app.get('/merchant/oauthisu', (req, res) => {
  console.log('ISU');
  log(req.query);
  res.send('success');
});
app.listen(3612); // ppm.songz.me

