const AWS = require("aws-sdk"); // Requires and params
AWS.config.update({ region: "ap-southeast-1" }); // Set Region
const athena = new AWS.Athena({ apiVersion: "2017-05-18" }); //

module.exports = {
  formatTime(obj){
    function pad(n){return n<10 ? '0'+n : n}
    let d = new Date(obj);

    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
  },
  addDays(date, days) {
    let temp = new Date(date);
    temp.setDate(temp.getDate() + days);
    return temp;
  },
  deepQuery(dbName, sql){
    return new Promise( (resolve, reject) => {
        const params = {
          QueryString: sql,
          ResultConfiguration: {
            OutputLocation: "s3://athena-results-store"
          },
          QueryExecutionContext: {
            Database: dbName
          }
        }

        athena.startQueryExecution(params, (err, data) => {
          if (err) {
            console.log(err);
            reject(new Error("Athena Transaction query fail"));
          }

          let key = data.QueryExecutionId.toString();
          resolve(key);
        });
      }
    )
  },
  generateTxReport(id, startDate, endDate) {
    return new Promise((resolve, reject) => {
      if (startDate == endDate){
        let temp = addDays(endDate, 1);
        endDate = formatTime(temp);
      }

      const athenaParams = {
        QueryString:
          "SELECT distinct m.displayname, v.transaction_id, v.datetime, v.merchant, v.merchant_id, v.account_id, v.order_id, v.product, v.mode, v.merchant_reference, v.payment_method, v.bin, v.last4, v.txn_amount, v.currency, v.action, v.status, v.payment_status, v.auth_code, v.eci, v.response_code, v.response_description, v.ip_address FROM rdp_datalake_api3_frontend.veritas as v JOIN rdp_datalake_api3_replica.mamaccounts as m ON m.id = v.account_id WHERE v.merchant_id = '" + id + "' AND v.datetime >= '" + startDate + "' AND v.datetime <= '" + endDate + "' ORDER BY v.datetime DESC;",
        ResultConfiguration: {
          OutputLocation: "s3://athena-results-store/"
        }
      };

      console.log(athenaParams);
      athena.startQueryExecution(athenaParams, (err, data) => {
        if (err) {
          console.log(err);
          reject(new Error("Athena Transaction query fail"));
        }

        let key = data.QueryExecutionId.toString();
        resolve(key);
      });
    });
  },
  generateTx(id, orderId) {
    return new Promise((resolve, reject) => {
      const athenaParams = {
        QueryString:
          "SELECT * FROM veritas WHERE merchant_id = '" +
          id +
          "' AND order_id = '" +
          orderId +
          "'",
        ResultConfiguration: {
          OutputLocation: "s3://athena-results-store/"
        },
        QueryExecutionContext: {
          Database: "rdp_datalake_api3_frontend  "
        }
      };

      athena.startQueryExecution(athenaParams, (err, data) => {
        if (err) {
          console.log(err);
          reject(new Error("Athena Transaction query fail"));
        }

        let key = data.QueryExecutionId.toString();
        resolve(key);
      });
    });
  },
  generateBillingReport(id, month) {
    return new Promise((resolve, reject) => {
      const athenaParams = {
        QueryString:
          "SELECT * FROM billing WHERE gid= '" +
          id +
          "' AND billing_date='" +
          month +
          "' AND amount != 0 ORDER BY trx_close_date ASC",
        ResultConfiguration: {
          OutputLocation: "s3://athena-results-store/"
        },
        QueryExecutionContext: {
          Database: "collaborate_report_frontend"
        }
      };

      athena.startQueryExecution(athenaParams, (err, data) => {
        if (err) {
          console.log(err);
          reject(new Error("Athena billing query fail"));
        }

        let key = data.QueryExecutionId.toString();
        resolve(key);
      });
    });
  },
  generateFundingReport(id, start, end) {
    return new Promise((resolve, reject) => {
      const athenaParams = {
        QueryString:
          "SELECT funding.mid, funding.merchant_name, report_type, amount, funding.currency, entry_type, term_date, trx_close_date, detail FROM funding INNER JOIN contract ON funding.mid=contract.mid WHERE gid = '" +
          id +
          "' AND term_date >= '" +
          start +
          "' AND term_date <= '" +
          end +
          "' AND amount != 0;",
        ResultConfiguration: {
          OutputLocation: "s3://athena-results-store/"
        },
        QueryExecutionContext: {
          Database: "collaborate_report_frontend"
        }
      };

      athena.startQueryExecution(athenaParams, (err, data) => {
        if (err) {
          console.log(err);
          reject(new Error("Athena Funding query fail"));
        }

        let key = data.QueryExecutionId.toString();
        resolve(key);
      });
    });
  }
};
