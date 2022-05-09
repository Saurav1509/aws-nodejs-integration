const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const res = require('express/lib/response');

var aws = require('aws-sdk');
aws.config.update({region: 'ap-south-1'});

const app = express();
var sqs = new aws.SQS({apiVersion: '2012-11-05'});

app.use('/public', express.static(path.join(__dirname,'static'))); // used to give a different name to the path from the actual one to hide the real server data form the public
app.use(bodyParser.urlencoded({extended: true})); // used to parse the url encoded data which is in the url and add it to the req body


app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname,'static','form.html'));
});

app.post('/', (req,res) =>{
    console.log(req.body);
    //database work
    res.send('successfully posted data');
});

app.get('/example', (req,res) =>{
    
    res.send('<form action="/product" method="POST" ><input type="text" name="title" /><button type="submit">Submit</button></form>');
});

app.post('/product', (req,res)=>{
    console.log(req.body);
    var data = req.body;
    res.send('<h1>Hi the data has been saved</h1>');
});
//-----------AWS SQS AND LAMBDA INTEGRATION---------
//------------Saurav1509@users.noreply.github.com---------------
app.get('/awsenvs', (req,res) =>{
    res.sendFile(path.join(__dirname,'static','aws_env.html'));
});

app.post('/awsenvspost', (req,res)=>{
    console.log(req.body);
    res.send(req.body.apps + ` ` + req.body.envs + ` is received at the server`);

    var awsenv = req.body.apps + req.body.envs;
    console.log(awsenv);

    if (req.body.envs == "dev") {
      sqs.sendMessage(params2, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.MessageId);
        }
      });
    }
    else{
      sqs.sendMessage(params1, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success", data.MessageId);
          }
        });
      }

});

var params1 = {
   DelaySeconds: 10,
   MessageAttributes: {
     "Title": {
       DataType: "String",
       StringValue: "AWS ENVS"
     },
     "Author": {
       DataType: "String",
       StringValue: "Saurav"
     },
     "WeeksOn": {
       DataType: "Number",
       StringValue: "6"
     }
   },
   MessageBody: "this is a sqs test message",
   QueueUrl: "https://sqs.ap-south-1.amazonaws.com/762680578686/testqueue"
 };

 var params2 = {
  DelaySeconds: 10,
  MessageAttributes: {
    "Title": {
      DataType: "String",
      StringValue: "AWS ENVS - 2"
    },
    "Author": {
      DataType: "String",
      StringValue: "Saurav-2"
    },
    "WeeksOn": {
      DataType: "Number",
      StringValue: "6"
    }
  },
  MessageBody: "this is a sqs test-2 message",
  QueueUrl: "https://sqs.ap-south-1.amazonaws.com/762680578686/testqueue2"
};

app.listen(3000);