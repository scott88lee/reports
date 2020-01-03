const AWS = require("aws-sdk"); //Requires and params

module.exports = {
  get(key) {
    // Retrieves CSV from S3 returns a string
    const s3 = new AWS.S3({ apiVersion: "2006-03-01"});

    const s3Params = {
      Bucket: "athena-results-store",
      Key: key
    };
    
    return new Promise((resolve, reject) => {
    s3.getObject(s3Params, (error, data) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      
      let payload = data.Body.toString("utf-8");
      resolve(payload.trim());
    });
  });
},
presign(key) {
  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  const params = {
    Bucket: 'athena-results-store',
      Key: key
    }
    
    return new Promise((resolve,reject)=>{
      s3.getSignedUrl('getObject', params, (error,data) => {
        if (error) {
          console.log(error);
          reject(error)
        }
        resolve(data);
      })
    })
  }
};
