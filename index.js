'use strict';

var AWS = require('aws-sdk');
AWS.config.update({region: "eu-west-1"});
var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});
const https = require('https');

const IOTA = require('iota.lib.js');
const iota = new IOTA({provider: 'https://nodes.devnet.iota.org:443'});
const address = process.env.address;
var params;

exports.handler = (event, context, callback) => {
    
  return new Promise((resolve, reject) => {
    iota.api.getBalances([address], 100, (err, res) => {
      if (err) {
        reject(err);
      }
      console.log(res.balances[0]);
      var NEW_balance = parseInt(res.balances[0], 10);
      
      params = {
        TableName: 'IOTABalance',
        Key: {
            'ID' : {'N': "0"}
        }
      };
      ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("DynamoDB error:", err);                    
          reject(err);
        } else {
          console.log("DynamoDB item:", data.Item);
          var OLD_balance = parseInt(data.Item.balance.S, 10);
          if (NEW_balance >= OLD_balance + 100) {
            var d = new Date();
            var mydate = parseInt(d.getTime()/1000, 10);
        	  mydate = mydate.toString();
        	  
        	  params = {
              TableName: "IOTABalance",
              Key:{
                "ID": {"N": String(0)}
            	},
              UpdateExpression: "set balance = :r, mydate = :p",
              ExpressionAttributeValues:{
                ":r": {"S":NEW_balance.toString()}, 
                ":p": {"S":mydate.toString()} 
              }, 
              ReturnValues:"UPDATED_NEW"
            };
        	  ddb.updateItem(params, function(err, data) {
              if (err) {
          	    console.log(err, err.stack); // an error occurred
                reject(err);
              } else {
                  const options = {
                    hostname: 'example.com',
                    port: 443,
                    path: '/iota',
                    method: 'GET'
                  };

                  const req = https.request(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
        
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                      return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
                    }
        
                    res.on('data', (chunk) => body += chunk);
                      res.on('end', () => {
                      console.log(body);
                      resolve(1);
                    });
                  });
                  req.on('error', (e) => {
                    console.error(e);
                  reject(e);
                });
                req.end();                
              }
            });
          } else {
            resolve(0);
          }
        }
      });  
    });
  });
};

