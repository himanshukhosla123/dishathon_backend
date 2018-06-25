var express = require('express');
// var connectToDb=require("./../utils/dbconnection");
var MongoClient=require("mongodb").MongoClient;
var router = express.Router();
var AWS=require("aws-sdk");
// var multer = require('multer');
const fileUpload = require('express-fileupload');
var path=require("path");
var fs=require("fs");
var sightengine = require('sightengine')('1788287833', 'dbfMy6Wb27Ri8aJ7yXVP');

// var storage = multer.diskStorage({
//     destination:"./uploads/"
// });

let s3bucket = new AWS.S3({
    accessKeyId: "AKIAIQ5CPIODG2HHHPHQ",
    secretAccessKey:"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",
    Bucket: "suspect-demo-bucket"
});

var dbURI="mongodb://himanshu:password123@ds263640.mlab.com:63640/dishtv";
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
router.get("/",(req,res)=>{
    res.send("hello");
})

var HOST="https://s3-us-west-2.amazonaws.com/dishathon-demo/";

/* GET users listing. */
router.get("/recentList",(req,res)=>{
   connectToDatabase()
   .then((db)=>{
        db.collection('recentList').find({}).limit(3)
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
}); 


router.get("/otherCatList",(req,res)=>{
   let obj=[];
   connectToDatabase()
   .then((db)=>{
        db.collection('tv_shows')
        .find( { $or: [ {type:"tv shows"},{type:"Sports"},{type:"Movie"},{type:"User"} ] })
        .toArray((err, docs) => {
        if (err) {
          console.log(err);
        }
          obj.push({
           cat:"Tv Shows",
           shows:docs.filter((obj)=>{return obj.type=="tv shows"}) 
          });
          obj.push({
            cat:"Movies",
            shows:docs.filter((obj)=>{return obj.type=="Movie"}) 
           });
           obj.push({
            cat:"Sports",
            shows:docs.filter((obj)=>{return obj.type=="Sports"}) 
           });
           obj.push({
            cat:"User Uploaded Content",
            shows:docs.filter((obj)=>{return obj.type=="User"}) 
           });

        res.json({data:obj});
        });

    })
    .catch((err) => {
        console.log(err);
    });
});

router.get("/showsList",(req,res)=>{
  connectToDatabase()
   .then((db)=>{
        db.collection('tv_shows').find({type:"tv shows"})
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
    // add image on a user in db
});

router.get("/moviesList",(req,res)=>{
    connectToDatabase()
   .then((db)=>{
        db.collection('tv_shows').find({type:"Movie"})
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
    //  add uploaded video details on db
});

router.get("/search",(req,res)=>{

});

router.get("/sportsList",(req,res)=>{
    connectToDatabase()
   .then((db)=>{
        db.collection('tv_shows').find({type:"Sports"})
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
    //  add uploaded video details on db
});

router.get('/videoDetails/:id',(req,res)=>{
    let id =req.params.id;
    connectToDatabase()
    .then((db)=>{
        db.collection('tv_shows').find({videoId:id})
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
});

// temp ref names list
let uploadedObjects=[];

router.post("/faceDetect",(req,res)=>{
    let sampleFile = req.files.avatar;
    let type=sampleFile.name.split(".")[1];
    // if(sampleFile.mimetype=="")
    let ref_name=getRandomName()+"."+type;
    uploadedObjects.push({
        real_name:sampleFile.name,
        name:ref_name
    });
    sampleFile.name=ref_name;
    console.log(sampleFile);
    sampleFile.mv(`./uploads/${sampleFile.name}`, function(err) {
        if (err)
          {console.log(err);}
           
          console.log("uploaded to server");
          
          upload(req,res,sampleFile); 
      });
    //   else
        // upload(req,res,sampleFile);     
    console.log(sampleFile,req.files);
    // upload(req,res,sampleFile);
});

// analyse video
router.get("/videoProducts/:videoId",(req,res)=>{
    let id =req.params.videoId;
    connectToDatabase()
    .then((db)=>{
        db.collection('videoProducts').find({videoId:id})
        .toArray((err, docs) => {
      if (err) {
          console.log(err);
        return res.status(500).send(`Error: ${err}`);
      }
          res.status(200).json({data:docs});
        });
    })
    .catch((err) => {
        res.status(500).send(`Error connecting to database: ${err}`);
    });
});

router.get("/analyseVideo/:name",(req,res)=>{
    var PythonShell = require('python-shell'); 
    var name=req.params.name;    

    var options = {
        mode: 'text',
    scriptPath: './uploads/',
    pythonOptions: ['-u'],
    args: [`${name}`]
    };

    var spawn = require("child_process").spawn;
    var process = spawn('python',["main.py",name] );
    process.stdout.on('data', function(data) {

        console.log(data.toString());
        res.send("done");
    } )


});



router.get("/demoimagedetect/:name",(req,res)=>{
    sightengine.check(['nudity','wad'])
    .video_sync(HOST+req.params.name)
    .then(function(result){
        res.json(result);
      }).catch(function(err) {
        res.json({error:err});
    });
});



function upload(req,res,file){

    var params = { Bucket: 'dishathon-demo', Key: file.name,
    Body:file.data,ACL: 'public-read'};
    try{
    s3bucket.putObject(params, function (err, data) {
    if (err) {
        res.status(500).json({error:err});
        console.log("Error creating the folder: ", err);
        } else {    
         res.status(200).json({
            url:file.name,
            name:file.name,
            type:file.mimetype
         });   
        console.log("Successfully created a folder on S3",data);
        }
    });
}
catch(e){
    
}
}

function randomId(){
    var text="";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function getRandomName(){
    var text="";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = router;
