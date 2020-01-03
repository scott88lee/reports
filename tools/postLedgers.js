const fetch = require('node-fetch');
const apiURL = "https://veritas.api.reddotpay.sg/v1/entry";

const headers = {
    'Content-Type':'application/json',
    'Accept':'application/json',
    'x-api-key':'jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo'
    };

var sample = {
    id: "4fb8a04a1f",
    reference: "9283dasdjk32",
    resource: "rid:cardpay:order/{orderId}", // {uuid}
    description: "string",
    detail: {
        detail1: "description1",
        detail2: "description2"
    },
    mode: "card", //card - alt - fund
    method: "mpgs", //mode fund is money going out of wallet
    entry: "credit",
    amount: 5.5, // always float
    currency: "USD", //Always 3char
    source: "rid:card:token/3241234",
    merchant: "rid:merchant:merchant/{merchantId}", //{uuid}
    account: "rid:merchant:account/{accountId}", //account belongs to merchent
    action: "authorize", //autocapture, authorise, capture, void, refund, close
    status: "success", //success, fail
    createdDate: "2018-08-17T09:52:08Z", // Transaction time
    importedDate: "2018-08-17T09:52:08Z" // import time  RFC3339 timestamp
};
    
//use idGen for mId and aId, date has to be YYYY-MM-DD
function txGenerator(merchantId, accountId, date) {
const CARD = ["maybank", "cybersource", "mpgs"];
let firstSix = ['4111111', '543212', '345678'];
const TYPE = ["credit", "debit"];
const ACTION = [
    "authorize",
    "capture",
    "refund",
    "close",
    "auto-capture",
    "void"
];
const PRODUCT = ['InstanCollect', 'InstanPay', 'Hotel']
const CURRENCY = ["SGD", "USD"];
const STATUS = ["success", "fail"];

let entry = {};

entry["reference"] = idGenerator(15);
entry["resource"] = "rid:cardpay:order/" + idGenerator(15);
entry["description"] = "TEST";
entry["details"] = {
    origin: PRODUCT[Math.floor(Math.random() * 3)],
    request: idGenerator(5),    //MERCHANT REFERENCE
    lastfour: "1234",
    transaction: {
        authcode: "ABC123",
        eci: '99'
    }
};

entry["mode"] = "card";
entry["method"] = CARD[Math.floor(Math.random() * 3)];
entry["entry"] = TYPE[Math.floor(Math.random() * 2)];

entry["amount"] = Math.floor(Math.random() * 10000) / 100;
entry["currency"] = CURRENCY[Math.floor(Math.random() * 2)];

if (entry.method == 'cybersource'){
    entry["source"] = "rid:card:token/" + firstSix[0] + "-" + idGenerator(8);
} else if (entry.method == 'mpgs'){
    entry["source"] = "rid:card:token/" + firstSix[1] + "-" + idGenerator(8);
} else {
    entry["source"] = "rid:card:token/" + firstSix[Math.floor(Math.random() * 3)] + "-" + idGenerator(8);
}

entry["merchant"] = "rid:merchant:merchant/" + merchantId;
entry["account"] = "rid:merchant:account/" + accountId;
entry["action"] = ACTION[Math.floor(Math.random() * 6)];
entry["state"] = ACTION[Math.floor(Math.random() * 4)];
entry["status"] = STATUS[Math.floor(Math.random() * 2)];

let dateTime = date + "T" + [Math.floor(Math.random() * 2)].toString() + [Math.floor(Math.random() * 10)].toString() + ":" + [Math.floor(Math.random() * 6)].toString() + [Math.floor(Math.random() * 6)].toString() + ":" + "00Z";
entry["date"] = { "created": dateTime };


return entry;
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
            console.log(body);           
        });
}

console.log(txGenerator("abc123", "321cba", '2018-12-01'));
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

postLedger('2018-12-01');