const axios = require('axios');

module.exports = {
  auth(key) {  //Placeholer AUTH function that returns role
    let payload = [
      {
        merchantId: "90d587c6-ba1f-494e-a996-46b1559d811c",
        merchantName: "Test Merchant for TX"
      },
      {
        merchantId: "D41D8CD98F00B204E9800998ECF8427E",
        merchantName: "Billing & Funding Merchant"
      }
    ]

    return payload;
  },
  listMid(key){
    return new Promise( (resolve,reject) => { 
      let URL = "https://mam.api.reddotpay.sg/v1/merchant?group=";
      let headers = {
        "Content-Type":"application/json",
        "x-api-key":"jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo"
      }
      let payload = [];
      
      axios.get(URL+key, {headers:headers})
      .then( res => {
        for (let i in res.data.items){
          payload.push(
            {
              merchantId: res.data.items[i].id,
              merchantName: res.data.items[i].name.legal
            }
          )
        }
        //
        resolve(payload);
        }).catch( err => console.log(err));
      })
  },
  listAll(url){
    return new Promise( (resolve,reject) => { 
      let URL = url;
      let headers = {
        "Content-Type":"application/json",
        "x-api-key":"jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo"
      }
      let payload = [];
      
      axios.get(URL, {headers:headers})
      .then( res => {
        payload = res.data;

        resolve(payload);
        }).catch( err => console.log(err));
      })
  }
}
