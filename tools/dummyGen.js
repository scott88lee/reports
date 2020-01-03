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
  const TYPE = ["credit", "debit"];
  const ACTION = [
    "autocapture",
    "authorise",
    "capture",
    "void",
    "refund",
    "close"
  ];
  const CURRENCY = ["SGD", "USD"];
  const STATUS = ["success", "fail"];

  let entry = {};

  entry["id"] = idGenerator(10);
  entry["reference"] = idGenerator(15);
  entry["resource"] = "rid:cardpay:order/" + idGenerator(10);
  entry["description"] = "string";
  entry["detail"] = {
    detail1: "description1",
    detail2: "description2"
  };
  entry["mode"] = "card";
  entry["method"] = CARD[Math.floor(Math.random() * 3)];
  entry["entry"] = TYPE[Math.floor(Math.random() * 2)];

  entry["amount"] = Math.floor(Math.random() * 10000) / 100;
  entry["currency"] = CURRENCY[Math.floor(Math.random() * 2)];
  entry["source"] = "rid:card:token/" + idGenerator(10);
  entry["merchant"] = "rid:merchant:merchant/" + merchantId;
  entry["account"] = "rid:merchant:account/" + accountId;
  entry["action"] = ACTION[Math.floor(Math.random() * 6)];
  entry["status"] = STATUS[Math.floor(Math.random() * 2)];
  entry["createdDate"] =
    date +
    "T" +
    [Math.floor(Math.random() * 2)].toString() +
    [Math.floor(Math.random() * 10)].toString() +
    ":" +
    [Math.floor(Math.random() * 6)].toString() +
    [Math.floor(Math.random() * 6)].toString() +
    ":" +
    "00Z";
  entry["importedDate"] = entry.createdDate;

  return entry;
}

function generate(count) {
  let data = [];
  for (let i = 0; i < count; i++) {
    data.push(txGenerator("merchant1", "account2", "2018-12-12"));
  }
  return data;
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

//Writes to JSON file
const jsonfile = require("jsonfile");
const file = "./data.json";
const obj = {};
obj["transactions"] = generate(100);
console.log("hey");

jsonfile.writeFile(file, obj, function(err) {
  if (err) console.error(err);
});
