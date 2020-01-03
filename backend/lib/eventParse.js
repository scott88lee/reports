module.exports = {
  parse(event) {
    let payload = {
      mode: "",
      key: ""
    };

    if (event) {
      payload.resource = event.resource.split('/')[1]
      let resource = payload.resource;
        
      if (event.queryStringParameters) {
        if (event.queryStringParameters.key){
          payload.key = event.queryStringParameters.key;
        }
        if (event.queryStringParameters.group){
          payload.group = event.queryStringParameters.group;
        }
      }

      if (event.body) {
        payload.body = JSON.parse(event.body);
      }

      if (resource == "transactions") {
        if (event.queryStringParameters.generate != null) {
          payload.mode = "generate";
          payload.key = event.queryStringParameters.generate;

          if (event.queryStringParameters.start != null) {
            payload.start = event.queryStringParameters.start;
          }
          if (event.queryStringParameters.end != null) {
            payload.end = event.queryStringParameters.end;
          }
          if (event.queryStringParameters.orderid != null) {
            payload.orderid = event.queryStringParameters.orderid;
          }
        } else {
          payload.error = "Invalid transaction search parameters"
        }
      }

      if (resource == "billing") {
        if (event.queryStringParameters.generate != null) {
          payload.mode = "generate";
          payload.key = event.queryStringParameters.generate;

          if (event.queryStringParameters.month != null) {
            payload.month = event.queryStringParameters.month;
          }
        } else {
          payload.error = "Invalid Billing search parameters"
        }
      }
      
      if (resource == "funding") {
        if (event.queryStringParameters.generate != null) {
          payload.mode = "generate";
          payload.key = event.queryStringParameters.generate;

          if (event.queryStringParameters.start != null) {
            payload.start = event.queryStringParameters.start;
          }
          if (event.queryStringParameters.end != null) {
            payload.end = event.queryStringParameters.end;
          }
        }
        else {
          payload.error = "Invalid Funding search parameters"
        }
      }
      console.log(payload);
      return payload;
    }
  }
};
