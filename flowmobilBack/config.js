require('dotenv').config();

const cookieParser = require('cookie-parser');
const mariadb = require('mariadb');
let dbParams ={
  host    : process.env.DB_HOST, 
  port    : process.env.DB_PORT,
  database: process.env.DB_DB,
  password: process.env.DB_PASS, 
  user    : process.env.DB_USER, 
  connectionLimit: 5, 
  trace: true,
  //logger:console.log
  };
const pool = mariadb.createPool(dbParams);
  pool.on("error", err => {
        console.log(err); //if error
      })
let tablesInDB =  pool.query({rowsAsArray: true,sql:'show tables'}).then(data=>tablesInDB=data.map(d=>d[0]));

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use((q,r,n)=>{
  q.db =pool; 
  q.tablesInDB = tablesInDB;
  return n();
  })


exports.app = app
