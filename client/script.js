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

function sendMsg(client, strKey){   
    client.set(strKey.client.clientID, JSON.stringify(strKey), function (err, repl) {
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
    generateForm(req,res,'./client/index.html', {'username': 'User',})
});

app.get('/bd', function(req,res){
    generateForm(req,res,'./client/tamplates/bd.html', {'answer': 'User',})
});

app.use('/css', express.static('./client/'));
app.use(express.urlencoded());

app.post('/', function(req,res){
    
    var a = {
        "client":
        {   
            "clientID":req.body.lsID,
            "clientFIO":req.body.fio,
            "clientAdr":req.body.adr,
            "clientMark":req.body.mark,
            "clientPhone":req.body.phone,
            "tiket":{
                "tiketID":req.body.tiketID,
                "breakdown":req.body.breakdown,
                "tiketToDo":req.body.whatToDo,
                "engineer":req.body.engineer,
                "testIP":req.ip.substring(7),
                "time":req.time,
                },
            "clientWishes":{
                "wish":req.body.wish,
                },            
            },
        }
    console.log(a);
    sendMsg(client, a);
    generateForm(req,res,'./client/index.html', {'username': 'User',});
});

app.listen(8081);

