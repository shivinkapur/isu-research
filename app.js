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

// Helper function to send post request and error handling
const post2 = (url, data, cb) => {
  request.post(url, data, (err, res, body) => {
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
              'PAYMENT',
              'REFUND',
              'PARTNER_FEE',
            ]
          }
        },
      }],
      web_experience_preference: {
        partner_logo_url: 'https://pbs.twimg.com/profile_images/960328536606191616/M_8xKwuC_400x400.jpg',
        return_url: 'https://ppm.songz.me/merchant/return',
        return_url_description: 'RETURN TO AWESOME SAUCE',
        use_mini_browser: true
      },
    }
  }, (body) => {
    res.json(body);
  });
});

app.get('/merchant/balances', (req, res) => {
  // Get merchant information (like target cid)
  request.get(`${ppUrl}/payment-experience/web-profiles?client_id=AZLu80lpVPlRrDMfNb5rXrPqb-EacAvi1PRiOAE4X9FQ7W8BSK8qinEvSf0aGNz6qEIc464R1NRJYpii`, {
    headers: {
      Authorization: `Bearer ${ppdata.access_token}`
    },
  }, (err, rez, body) => {
    if(err) return res.json(err);
    if(!body) return res.json(rez);
    const result = (typeof body === 'string') ? JSON.parse(body) : body;
    res.json(result);
  });
});

// User is returned here after ISU flow
app.get('/merchant/return', (req,res) => {
  // Get merchant information (like target cid)
  const queries = req.query;
  request.get(`${ppUrl}/customer/partners/${partnerId}/merchant-integrations/${req.query.merchantIdInPayPal}`, {
    headers: {
      Authorization: `Bearer ${ppdata.access_token}`
    },
  }, (err, rez, body) => {
    const result = (typeof body === 'string') ? JSON.parse(body) : body;

    // When app starts, get an oauth token
    post('/oauth2/token', {
      form: {
        grant_type: 'client_credentials' ,
        target_client_id: result.oauth_integrations[0].oauth_third_party[0].merchant_client_id,
      },
      auth: {
        user: cid,
        pass: secret,
      },
    }, (body) => {
      result.newData = body;
      result.queries = req.query;


      //request.get(`${ppUrl}/offers/containers`, {
      //request.get(`${ppUrl}/identity/openidconnect/userinfo?schema=openid`, {
      //request.get(`${ppUrl}/identity/oauth2/userinfo?schema=openidconnect`, {
      console.log(`${ppUrl}/customer/partners/merchant-accounts/${result.merchant_id}`);
      request.get(`${ppUrl}/customer/partners/merchant-accounts/${result.merchant_id}`, {
        headers: {
          Authorization: `Bearer ${body.access_token}`
        },
      }, (err2, rez2, body2) => {
        if(err2) return res.json(err2);
        if(!body2) return res.json(rez2);
        const result3 = (typeof body2 === 'string') ? JSON.parse(body2) : body2;
        result.newData = result3;
        res.json(result);
      });


      //res.json(result);
    });

  });
});

app.listen(3612); // ppm.songz.me

