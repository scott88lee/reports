const csv = require('./lib/csvResults');
const athena = require('./lib/athena');
const e = require('./lib/eventParse');
const auth = require('./lib/auth');
const axios = require('./node_modules/axios')
const qs = require('./node_modules/querystring')
require('custom-env').env()

const MODE_CARDPAY = 'cardpay';
const MODE_ALTPAY = 'altpay';

/**
 * Return 405 (Method not allowed)
 */
const methodNotAllowed = () => {
  return {
    statusCode: 405
  }
}

/**
 * Request access token
 *
 * @param String type Refund or Void
 * @param String mode Api mode (cardpay, altpay, etc...)
 *
 * @return JSON auth
 */
const doAuthorize = (type, mode) => {
  const oAuthEndpoint = process.env.O_AUTH_ENDPOINT;
  console.log("The OAuth end point is " + oAuthEndpoint);
  const clientId = process.env.CLIENT_ID;
  console.log("ClientID is " + clientId);
  const clientSecret = process.env.CLIENT_SECRET;
  console.log("Client Secret is " + clientSecret);
  const grantType = 'client_credentials';
  // let scope = null;

  // Prepare response object
  let response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }

  // Check refund or void, and cardpay or altpay

  // switch (type.toLowerCase()) {
  //   case 'refund':
  //     if (mode.toLowerCase() == MODE_CARDPAY) {
  //       console.log("inside Auth() Card Payment mode");
  //       scope = `https://cardpay.${process.env.API_ENDPOINT}/order.refund`;
  //       console.log(scope);
  //     } else if (mode.toLowerCase() == MODE_ALTPAY) {
  //       console.log("inside Auth() Alternate Payment mode");
  //       scope = `https://altpay.${process.env.API_ENDPOINT}/order.refund`;
  //       console.log(scope);
  //     }
  //     break;
  //   case 'void':
  //     if (mode.toLowerCase() == MODE_CARDPAY) {
  //       scope = `https://cardpay.${process.env.API_ENDPOINT}/order.void`;
  //     } else if (mode.toLowerCase() == MODE_ALTPAY) {
  //       scope = `https://altpay.${process.env.API_ENDPOINT}/order.void`;
  //     }
  //     break;
  //   default:
  //     // Bad request
  //     response.statusCode = 400;
  //     return response;
  // }

  // Make a auth request
  return axios.post(
      oAuthEndpoint,
      qs.stringify({
        grant_type: grantType
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        }
      }
    )
    .then((res) => {
      response.body = JSON.stringify(res.data);
      return response;
    })
    .catch((err) => {
      console.log('doing authorize...')
      console.log(err.stack)
      response.statusCode = 400;
      return response;
    })
}

/**
 * Do refund
 *
 * @param {*} auth
 * @param {*} req
 */
const doRefund = (auth, req) => {
  const accessToken = JSON.parse(auth.body).access_token;
  const apiKey = process.env.API_KEY;

  let apiEndpoint = null;
  if ((req.body.mode).toLowerCase() == MODE_CARDPAY) {
    apiEndpoint = `https://cardpay.${process.env.API_ENDPOINT}/v1`;

  } else if ((req.body.mode).toLowerCase() == MODE_ALTPAY) {
    apiEndpoint = `https://altpay.${process.env.API_ENDPOINT}/v1`;
  }

  // Prepare response object
  let response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }

  // Make a refund request
  return axios.post(
      apiEndpoint + '/order/' + req.body.orderId + '/refund', {
        amount: Number(req.body.amount),
        currency: req.body.currency
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'x-api-key': apiKey,
          'Authorization': accessToken
        }
      }
    )
    .then((res) => {
      response.body = JSON.stringify(res.data);
      return response;
    })
    .catch((err) => {
      console.log('doing refund...')
      console.log(err.stack)
      response.statusCode = 400;
      return response;
    })
}

/**
 * Do Void
 *
 * @param req
 */
const doVoid = (auth, req) => {
  const accessToken = JSON.parse(auth.body).access_token;
  const apiKey = process.env.API_KEY;

  let apiEndpoint = null;
  if ((req.body.mode).toLowerCase() == MODE_CARDPAY) {
    apiEndpoint = `https://cardpay.${process.env.API_ENDPOINT}/v1`;
  } else if ((req.body.mode).toLowerCase() == MODE_ALTPAY) {
    apiEndpoint = `https://altpay.${process.env.API_ENDPOINT}/v1`;
  }

  // Prepare response object
  let response = {
    isBase64Encoded: false,
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }

  // Make a void request
  return axios.post(
      apiEndpoint + '/order/' + req.body.orderId + '/void', {

      }, {
        headers: {
          'Accept': 'application/json',
          'x-api-key': apiKey,
          'Authorization': accessToken
        }
      }
    )
    .then((res) => {
      response.body = JSON.stringify(res.data);
      return response;
    })
    .catch((err) => {
      console.log('doing void...')
      console.log(err.stack)
      response.statusCode = 400;
      return response;
    })
}

/**
 * Do Notification 
 *
 * @param req
 */

const notify = async (req) => {
  let messageUrl = `https://hermes.api.reddotpay.sg/v1/message`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': process.env.API_KEY,
  };

  let resMsg = {};
  let messageData = JSON.parse(req.body);

  await axios({
      method: 'post',
      url: messageUrl,
      data: JSON.stringify(messageData),
      headers: requestHeaders,
    })
    .then((response) => {
      if (response.status === 200) {
        resMsg.statusCode = 200;
        resMsg.body = JSON.stringify({
          "status": true,
          "message": "notification sent!"
        });
      }
    })
    .catch((e) => {
      resMsg.statusCode = 500;
      resMsg.body = JSON.stringify({
        "status": false,
        "message": "Internal Server error!"
      });
      console.log(e.stack);
    });
  return resMsg;
};


exports.handler = async (event) => {
  let response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': 86400,
      'Content-Type': 'application/json',
    },
    "body": "default",
    "isBase64Encoded": false
  };

  try {
    let req = e.parse(event);

    switch (req.resource) {
      case 'refund':
        if (event.httpMethod == "POST") {
          const auth = await doAuthorize('refund', req.body.mode);
          return await doRefund(auth, req);
        }
        return methodNotAllowed();

      case 'void':
        if (event.httpMethod == "POST") {
          const auth = await doAuthorize('void', req.body.mode);
          return await doVoid(auth, req);
        }
        return methodNotAllowed();

      case 'notify':
        if (event.httpMethod == "POST") {
          return await notify(event);
        }
        return methodNotAllowed();

    }

    if (req.resource == "auth") {
      if (req.key) {
        let context = auth.auth(req.key);
        response.body = JSON.stringify(context);
        return response;
      }
      if (req.group === 'rdp') {
        let url = "https://mam.api.reddotpay.sg/v1/merchant?limit=100"
        let context = {};
        let tempData = [];
        let bodyData = [];
        do  {
          if(tempData.length > 0) {
            url = context.links[0].href;
          }
          context = await auth.listAll(url);
          tempData = [...tempData, ...context.items];
        }
        while(context.links)

        tempData.forEach(item => {
          bodyData.push({
            merchantId: item.id,
            merchantName: item.name.legal
          });
        });

        response.body = JSON.stringify(bodyData);
        return response;
      } else if (req.group !== 'admin') {
        let context = await auth.listMid(req.group);
        response.body = JSON.stringify(context);
        return response;
      }
    } else if (req.resource == "deep") {
      let context = {
        key: await athena.deepQuery(req.body.db, req.body.sql)
      };
      response.body = JSON.stringify(context);
      return response;
    } else if (req.resource == 'retrieve') {
      let temp = await csv.get(req.key + '.csv');
      response.body = JSON.stringify(temp);
      return response;
    } else if (req.resource == 'presign') {
      let temp = await csv.presign(req.key + '.csv');
      response.body = JSON.stringify(temp);
      return response;
    } else if (req.resource == "transactions") {
      if (req.mode == "generate") {
        if (req.orderid != null) {
          let context = {
            key: await athena.generateTx(req.key, req.orderid)
          };
          response.body = JSON.stringify(context);
          return response;
        } else {
          let context = {
            key: await athena.generateTxReport(req.key, req.start, req.end)
          };
          response.body = JSON.stringify(context);
          return response;
        }
      }
    } else if (req.resource == "billing") {
      if (req.mode == "generate") {
        let context = {
          key: await athena.generateBillingReport(req.key, req.month)
        };
        response.body = JSON.stringify(context);
        return response;
      }
    } else if (req.resource == "funding") {
      if (req.mode == "generate") {
        let context = {
          key: await athena.generateFundingReport(req.key, req.start, req.end)
        };
        response.body = JSON.stringify(context);
        return response;
      }
    }
  } catch (error) {
    console.log(error);
    response.body.error = JSON.stringify(error);
    return response;
  }
}