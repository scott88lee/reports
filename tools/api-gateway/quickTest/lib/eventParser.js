module.exports = {
  parse(event) {
    
    let payload = {
      resource: "",
      method: "",
      key: "",
      body: ""
    }

    if(event){
      
      payload.path = event.path;
      payload.method = event.httpMethod;
      
      if(event.queryStringParameters){
        if(event.queryStringParameters.key){
          payload.key = event.queryStringParameters.key;
        } else {
          payload.key = "Key is undefined."
        }
      }
      if(event.body){
        payload.body = JSON.parse(event.body)
      }
      return payload;
    }
  }
}