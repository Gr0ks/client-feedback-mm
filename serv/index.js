var http = require('http');
var express = require('express');
var swig = require('swig');
var app = express();
var templates = templates || [];
var redis = require('redis');
var client = redis.createClient();
var t;
client.on("error", function (err) {
    console.log("Error: " + err);
  });

function redisWrite(client, strKey){   
    client.set(strKey.client.clientFIO, JSON.stringify(strKey), function (err, repl) {
        if (err) {
               console.log('Что то случилось при записи: ' + err);               
        } else {console.log('Write OK');};
        });
    
};



function generateForm(req,res, formH, text){
    key=req.path;
    console.log(key);
    var page=swig.compileFile(formH);
    
    res.send(page(text));
}; 

app.get('/', function(req,res){
    generateForm(req,res,'./serv/tamplates/feedback.html', {'username': 'User',})
});

app.get('/bd', function(req,res){
    generateForm(req,res,'./serv/tamplates/bd.html', {'answer': 'User',})
});

app.use(express.urlencoded());

app.post('/', function(req,res){
    var a = {
        "client":
        {   
            "clientFIO":req.body.fio,
            "clientAdr":req.body.adr,
            "clientMark":req.body.mark,
            "tikets":{
                "tiketID":req.body.tiket,
                "tiketSrc":req.body.neispravnost,
                "tiketToDo":req.body.toDo,
                },
            "clientWishes":{
                "wish":req.body.wish,
                },            
            },
        }
    console.log(a);
    redisWrite(client, a);
    generateForm(req,res,'./serv/tamplates/feedback.html', {'username': 'User',});
});

app.listen(8081);

