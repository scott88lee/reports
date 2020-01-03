const axios = required('../node_modules/axios')

module.exports = {
  auth(key) {  //Placeholer AUTH function that returns role
    let payload = {
      role: 'merchant',
      merchantId: 'abc123',
      merchantName: 'Best Merchant Pte Ltd'
    };
    
    axios.get('https://deep.api.reddotpay.sg/v1/auth?key=asdasd')
    .then( res => {
      console.log( res )
      console.log( key )
      return payload;
    })
  }
}
