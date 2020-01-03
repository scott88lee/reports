arr = [
  {term_date: "2018-12-05", mid: "123", merchantName: "ABC(US) store", currency:"USD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "123", merchantName: "ABC(US) store", currency:"USD", report_type: "Balance", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b234", merchantName: "BABC(US) store", currency:"USD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-06", mid: "123", merchantName: "ABC(US) store", currency:"USD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-04" },
  {term_date: "2018-12-06", mid: "b234", merchantName: "BABC(US) store", currency:"USD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-04" },
  {term_date: "2018-12-05", mid: "123", merchantName: "ABC(US) store", currency:"USD", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b234", merchantName: "BABC(US) store", currency:"USD", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" },

  {term_date: "2018-12-05", mid: "1y23", merchantName: "BC(SG) store", currency:"SGD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b234", merchantName: "AC(SG) store", currency:"SGD", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "1y23", merchantName: "BC(SG) store", currency:"SGD", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b234", merchantName: "AC(SG) store", currency:"SGD", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" },

  {term_date: "2018-12-05", mid: "12k3", merchantName: "ABAC(TH) store", currency:"THB", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b2u34", merchantName: "ABBC(TH) store", currency:"THB", report_type: "sale", amount:"3.99", entry: "credit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "12k3", merchantName: "ABAC(TH) store", currency:"THB", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" },
  {term_date: "2018-12-05", mid: "b2u34", merchantName: "ABBC(TH) store", currency:"THB", report_type: "fee", amount:"0.99", entry: "debit", tx_date: "2018-12-03" }      
]

let temp = {};
let res = [];

for (let i in arr) {
  if (!temp[arr[i].currency]){
    res.push(
      {
        currency: arr[i].currency,
        dates: []
      }
    )
    temp[arr[i].currency] = true;
  }
}

for (let i=0; i<res.length; i++){
  let temp = {};
  console.log(temp);
  for (let j in arr) {
    if (!temp[arr[j].term_date] && arr[j].currency == res[i].currency){
      res[i].dates.push(
        { 
          "date" : arr[j].term_date,
          "accounts" : []
        }
      )
      temp[arr[j].term_date] = true;
    }      
  }
}

for (let i=0; i<res.length; i++){
  for (let j=0; j<res[i].dates.length; j++){
    let temp = {};
    for (let k=0; k<arr.length; k++) {
      if (!temp[arr[k].mid] && arr[k].currency === res[i].currency && arr[k].term_date === res[i].dates[j].date) {
        res[i].dates[j].accounts.push(
          {
            "aid" : arr[k].mid,
            "accountName": arr[k].merchantName,
            "fundingTotal": 0,
            "reports" : []
          }
        )
        temp[arr[k].mid] = true;
      }
    }
  }    
}

for (let i=0; i<res.length; i++){
  for (let j=0; j<res[i].dates.length; j++){
    for (let k=0; k<res[i].dates[j].accounts.length; k++){
      for (let h =0; h<arr.length; h++){

      
      if (arr[h].currency == res[i].currency && arr[h].term_date == res[i].dates[j].date && arr[h].mid == res[i].dates[j].accounts[k].aid){
        res[i].dates[j].accounts[k].reports.push(
          {
            reporttype : arr[h].report_type,
            amount : arr[h].amount,
            entry : arr[h].entry,
            txDate : arr[h].tx_date
          }
        )
        if (arr[h].entry == "credit"){
          res[i].dates[j].accounts[k].fundingTotal += parseFloat(arr[h].amount);
        } else if (arr[h].entry == "debit"){
          res[i].dates[j].accounts[k].fundingTotal -= parseFloat(arr[h].amount);
        }
      }
    }
    }
  }    
}

console.log(res[0].dates[0]);
console.log(res[0].dates[0].accounts[0]);