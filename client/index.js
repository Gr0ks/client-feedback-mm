var http = require('http');
var express = require('express');
var swig = require('swig');
var app = express();
var templates = templates || [];
const mysql = require("mysql2");
 
const connection = mysql.createConnection({
  host: "localhost",
  user: "admin",
  database: "mm_db",
  password: "f7_Yn8ZERsSt_b!"
});
 connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });

 const sql_insert_wish = "INSERT INTO wishes(wish, user_id) VALUES(?, ?)";
 const sql_insert_phone = "INSERT INTO phone(phone_number, user_id) VALUES(?, ?)";
 const sql_insert_tiket = "INSERT INTO tikets(tiket_id_by_billing, breakdown, tiket_to_do, test_ip, client_id, employee_id) VALUES(?, ?, ?, ?, ?, ?)";
 const sql_insert_client = "INSERT INTO clients(name, address, mark, id_by_billing) VALUES(?, ?, ?, ?)";
  


function sendMsg(connection, strKey){
    let employee_id;
    connection.execute("SELECT * FROM employee WHERE surname='"+strKey.tiket.engineer+"'",
        function(err, resultss, fields) {
            console.log(err);
            
            employee_id = resultss[0].employee_id;
        });

    connection.query("SELECT * FROM clients WHERE id_by_billing='"+strKey.clientID+"'",
    function(err, results, fields) {
        console.log(err);
        
        
        if(results[0]!=null){
            user_id=results[0].id;
            //пишем остальные таблицы кроме clients 
            connection.query("UPDATE clients SET mark=? WHERE id=?",
                [strKey.clientMark, user_id], 
                function(err, results) {
                    if(err) console.log(err);
                    else console.log("Данные добавлены");
                });                      
            connection.query("INSERT INTO tikets(tiket_id_by_billing, breakdown, tiket_to_do, test_ip, client_id, employee_id) VALUES(?, ?, ?, ?, ?, ?)",
                [strKey.tiket.tiketID, strKey.tiket.breakdown, strKey.tiket.tiketToDo, strKey.tiket.testIP, user_id, employee_id], 
                function(err, results) {
                    if(err) console.log(err);
                    else console.log("Данные добавлены");
                });
            connection.query("INSERT INTO wishes(wish, user_id) VALUES(?, ?)",
                [strKey.wish, user_id], 
                function(err, results) {
                    if(err) console.log(err);
                    else console.log("Данные добавлены");
                });
            connection.query("SELECT * FROM phone WHERE phone_number='"+strKey.clientPhone+"'",
                function(err, results, fields) {
                    console.log(err);
                    if(results[0]!=null){
                        console.log(err);
                    }else{
                        connection.query("INSERT INTO phone(phone_number, user_id) VALUES(?, ?)",
                        [strKey.clientPhone, user_id], 
                        function(err, results) {
                            if(err) console.log(err);
                            else console.log("Данные добавлены");
                        }); 
                    }
                });
        }else{
            //пишем все таблицы
            let users_id;
            
            connection.query("INSERT INTO clients(name, address, mark, id_by_billing) VALUES(?, ?, ?, ?)",
                 [strKey.clientFIO, strKey.clientAdr, strKey.clientMark, strKey.clientID], function(err, results) {
                if(err) console.log(err);
                else console.log("Данные добавлены");
            });
            connection.execute("SELECT * FROM clients WHERE id_by_billing='"+strKey.clientID+"'",
            function(err, resultss, fields) {
                console.log(err);
                users_id = resultss[0].id;
                
                connection.query("INSERT INTO tikets(tiket_id_by_billing, breakdown, tiket_to_do, test_ip, client_id, employee_id) VALUES(?, ?, ?, ?, ?, ?)",
                    [strKey.tiket.tiketID, strKey.tiket.breakdown, strKey.tiket.tiketToDo, strKey.tiket.testIP, users_id, employee_id], 
                    function(err, results) {
                        if(err) console.log(err);
                        else console.log("Данные добавлены");
                    });
                
                connection.query("INSERT INTO wishes(wish, user_id) VALUES(?, ?)",
                    [strKey.wish, users_id], 
                    function(err, results) {
                        if(err) console.log(err);
                        else console.log("Данные добавлены");
                    });
                connection.query("SELECT * FROM phone WHERE phone_number='"+strKey.clientPhone+"'",
                    function(err, results, fields) {
                        console.log(err);
                        if(results[0]!=null){
                            console.log(err);
                        }else{
                            connection.query("INSERT INTO phone(phone_number, user_id) VALUES(?, ?)",
                            [strKey.clientPhone, users_id], 
                            function(err, results) {
                                if(err) console.log(err);
                                else console.log("Данные добавлены");
                            }); 
                        }
                    });
                });
            
            
        }
        

    });
    



    
};

function get_analitics(connection,req,res){
    


    //SELECT * FROM `tikets` ORDER BY `tikets`.`client_id`
    connection.query("SELECT * FROM `tikets` INNER JOIN `clients` ON tikets.client_id = clients.id",                     
                    function(err, results) {
                        if(err){ 
                            console.log(err);
                        }else{
                            let resu =[];               
                            resu =JSON.stringify(results);
                            let resul={"texts": JSON.parse(resu)};
                            generateForm(req,res,'./client/tamplates/analitics.html',resul)
                        };
                    });
    
};



function generateForm(req,res, formH, text){
    key=req.path;
    console.log(key);
    var page=swig.renderFile(formH,text);
    
    res.send(page);
}; 

app.get('/', function(req,res){
    generateForm(req,res,'./client/tamplates/index.html', {'username': 'User', 'from': 'mm'})
});

app.get('/a', function(req,res){
    get_analitics(connection,req,res)
    
});



app.use('/css', express.static('./client/tamplates/'));
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
                },
            "wish":req.body.wish,
                       
            },
        }
//    console.log(a);
    sendMsg(connection, a.client);
    generateForm(req,res,'./client/tamplates/index.html', {'username': 'User',});
});

app.listen(8081);

