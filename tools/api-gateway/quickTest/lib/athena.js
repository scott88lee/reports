const AWS = require("aws-sdk");                     // Requires and params
AWS.config.update({ region: "ap-southeast-1" });    // Set Region
const athena = new AWS.Athena({apiVersion: "2017-05-18"}); //

module.exports = {
  deepQuery(sql,dbName){
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
            reject(new Error(err));
          }
  
          let key = data.QueryExecutionId.toString();
          resolve(key);
        });
      }
    )
  }
};
