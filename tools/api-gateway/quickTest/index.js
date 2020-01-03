const athena = require('./lib/athena');
const csv = require('./lib/s3Handler');
const e = require('./lib/eventParser');
const auth = require('./lib/auth');

exports.handler = async (event) => {
  let response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Max-Age': 86400,
			'Content-Type': 'application/json',
      },
    "body": "Default event error",
    "isBase64Encoded": false
  };

  let req = e.parse(event);

  if(req.path == '/auth'){
    let context = auth.auth(req.key);
    response.body = JSON.stringify(context);
    return response;
  } 
  else if(req.path == '/deep'){
    let context = { key: await athena.deepQuery(req.body.db, req.body.sql) };
    response.body = JSON.stringify(context);
    return response;
  }
  else if(req.path == '/retrieve'){
    let temp =  await csv.get(req.key +'.csv');
    response.body = JSON.stringify(temp);
    return response;
  } 
  else if(req.path == '/presign'){
    let temp =  await csv.presign(req.key+'.csv');
    response.body = JSON.stringify(temp);
    return response;
  } else {
    return response;
  }
}