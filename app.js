var express=require("express");
var app=express(),
logger=require("morgan"),
bodyParser=require("body-parser"),
errorhandler=require("errorhandler")
mongoose=require("mongoose"),
path=require("path");
var cors = require('cors')
var api=require('./routes');

const fileUpload = require('express-fileupload');
app.use(fileUpload());
// cors module
app.use(cors())
 

app.use(bodyParser.json())
app.use(logger('dev'))
app.use(errorhandler())

app.use(express.static(path.join(__dirname, 'public')));

let store={};
store.accounts=[];

// api
app.use('/api', api);

app.get('/', (req, res) => {
    res.render("index.html");
});
  
app.listen(3005);

// mongodb://himanshu:password123@ds263640.mlab.com:63640/dishtv