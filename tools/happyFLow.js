var sample = {
  reference: '0035jj9n4399',
  resource: 'rid:cardpay:order/cy7p2xlgx7a',
  mode: 'card',
  method: 'cybersource',
  entry: 'credit',
  amount: 16.51,
  currency: 'SGD',
  source: 'rid:card:token/4111111-b45gnoxc',
  action: 'authorize',
  status: 'success',
  state: 'authorize',
  merchant: 'rid:merchant:merchant/90d587c6-ba1f-494e-a996-46b1559d811c',
  account: 'rid:merchant:account/3cd7433a-a094-4627-bbd4-101f0f30aedc',
  description: 'TEST',
  details:
   { origin: 'InstanPay',
     request: 'e7lzo',
     lastfour: '1234',
     transaction: { authcode: 'ABC123', eci: '99' } },
  date:
   { created: '2018-10-01T14:00:00Z'}
}

const fetch = require('node-fetch');
const apiURL = "https://veritas.api.reddotpay.sg/v1/entry";

const headers = {
    'Content-Type':'application/json',
    'Accept':'application/json',
    'x-api-key':'jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo'
    };

const params = {
    gateWay : ["maybank", "cybersource", "mpgs"],
    firstSix : ['4111111', '543212', '345678'],
    entry : ["credit", "debit"],
    action : ["authorize", "capture", "refund", "close", "auto-capture", "void"],
    product : ['InstanCollect', 'InstanPay', 'Hotel'],
    currency: ["SGD", "USD"],
    status: ["success", "fail"]
}

//use idGen for mId and aId, date has to be "YYYY-MM-DD"
function cardHappyFlow(merchantId, accountId, date) {
    let flow = []
    let txn = {};
    let order = "rid:cardpay:order/" + idGenerator(15);
    let gateway = params.gateWay[Math.floor(Math.random() * 3)];
    let txnAmount = Math.floor(Math.random() * 10000) / 100;
    let token = "rid:card:token/" + params.firstSix[Math.floor(Math.random() * 3)] + "-" + idGenerator(8);
    let time = [Math.floor(Math.random() * 2)].toString() + [Math.floor(Math.random() * 10)].toString() + ":";
    let dateTime1 = date + "T" + time + "00:00Z";
    let dateTime2 = date + "T" + time + "15:00Z";


    txn["reference"] = idGenerator(15);
    txn["resource"] = order
    txn["description"] = "Card Pay";
    txn["details"] = {
        origin: params.gateWay[0],
        request: idGenerator(5),    //MERCHANT REFERENCE
        lastfour: "1234",
        transaction: {
            "authcode": "ABC123",
            "eci": '99'
        }
    };

    txn["mode"] = "card";
    txn["method"] = gateway;
    txn["entry"] = "credit";

    txn["amount"] = txnAmount;
    txn["currency"] = params.currency[0];
    txn["source"] = token;

    txn["merchant"] = "rid:mam:merchant/" + merchantId;
    txn["account"] = "rid:mam:account/" + accountId;
    txn["action"] = params.action[0];
    txn["status"] = "success";
    txn["state"] = params.action[0]

    txn["date"] = { "created": dateTime1 };

    flow.push( JSON.parse( JSON.stringify(txn) ) );
    
    txn.reference = idGenerator(15);
    txn["action"] = params.action[1];
    txn["status"] = "success";
    txn["state"] = params.action[1]
    txn["date"] = { "created": dateTime2 };
    flow.push(JSON.parse( JSON.stringify(txn) ) );

    return flow;
}

//Fake uuid generator
function idGenerator(length) {
    var _sym = "abcdefghijklmnopqrstuvwxyz1234567890";
    var str = "";

    for (let i = 0; i < length; i++) {
        str += _sym[parseInt(Math.random() * _sym.length)];
    }
    return str;
}

function postLedger(date){
    let payload = txGenerator("abc123", "321cba", date);
    fetch( apiURL, {method: 'POST',
                    body: JSON.stringify(payload),
                    headers: headers
                    } 
        )
        .then(function(res) {
            console.log('fetching')
            return res.json();
        }).then(function(body) {
            console.log('Success: ' + body);           
        });
}

function post(payload){
    fetch( apiURL, {method: 'POST',
                    body: JSON.stringify(payload),
                    headers: headers
                    } 
        )
        .then(function(res) {
            console.log('fetching')
            return res.json();
        }).then(function(body) {
            console.log(body);           
        });
}

function genTxn(){
    let payload = cardHappyFlow("90d587c6-ba1f-494e-a996-46b1559d811c", "7d89c8cb-a66d-41e5-a3bb-6fb60ff772e4", '2019-01-29');
    for (let i=0; i<payload.length; i++) {
        setTimeout( function(){
            console.log(payload[i])
            post(payload[i]);
        }, 100 + i*150);
    }    
}

genTxn();

// var days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];

// for (let i=0; i<days.length; i++) {
//     let date = '2018-01-' + days[i];
//     let count = Math.floor(Math.random() * 20);

//     for (let k=0; k<count; k++) {
//         setTimeout(function(){
//             postLedger(date);
//             console.log(date);
//         }, 100 + k*200)
//     }
// }