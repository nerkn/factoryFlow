require('dotenv').config();
var axios = require('axios');

async function findOne(collection, filter){ 
  let config = {
    method: 'post',
    url: 'https://eu-central-1.aws.data.mongodb-api.com/app/data-ihdfb/endpoint/data/v1/action/findOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': '1jMwYcjbLf7xRA5CnabwbLBTcASmj5ytJXQbUgy9Pjvo83oyS9nUiCH82Ch6Py18',
    },
    data: JSON.stringify({
    "dataSource": "AtlasCluster",
    "database": "flowmobil35",
    "collection": collection,
    "filter": filter
    })
  };
  return axios(config)
            .then((response)  =>JSON.stringify(response.data))
            .catch((error)    => {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      });
}



let tablesInDB =  [];//pool.query({rowsAsArray: true,sql:'show tables'}).then(data=>tablesInDB=data.map(d=>d[0]));
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((q,r,n)=>{
  q.findOne     =  findOne; 
  q.tablesInDB  = tablesInDB;
  return n();
  })


module.exports = {app, findOne}
