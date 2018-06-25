const MongoClient = require('mongodb').MongoClient;
const dbURI = "mongodb://:@ds141870.mlab.com:41870/suspect";


const connectToDatabase = () => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(dbURI, (err, db) => {
        if (err) {
          reject(err)
        }
        resolve(db)
      })
  
    })
};
module.exports = connectToDatabase;