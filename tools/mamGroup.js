const axios = require('axios');

let URL = "https://mam.api.reddotpay.sg/v1/merchant?group=";
let key = "12856fa4-7508-4972-bf4c-9c47e9551847";

let headers = {
  "Content-Type":"application/json",
  "x-api-key":"jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo"
}
axios.get(URL+key, {headers:headers})

.then( (res) => {
  console.log(res.data);
})
.catch(error => {
  if (error){
    console.log(error)
  }
})