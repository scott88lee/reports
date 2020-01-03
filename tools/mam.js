const fetch = require('node-fetch');

const inputBody = {
  "merchant": {
    "id": "string"
  },
  "name": {
    "dba": "string",
    "legal": "string"
  },
  "secure": "required",
  "files": [
    "string"
  ],
  "brands": [
    "string"
  ],
  "products": [
    "string"
  ],
  "brn": "string",
  "scope": "string",
  "entity": "string",
  "country": "string",
  "websites": {
    "trading": "string",
    "csp": "string"
  },
  "manager": "string",
  "group": "string",
  "industry": "string",
  "annualVolume": 0,
  "risk": "1",
  "mcc": "string",
  "status": "created",
  "date": {
    "deployed": "string",
    "launched": "string",
    "expired": "string"
  }
};

const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'API_KEY'

};

fetch('https://mam.api.reddotpay.sg/v1/merchant',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});