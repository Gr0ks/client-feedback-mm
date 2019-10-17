var http = require('http');
var express = require('express');
var swig = require('swig');
var app = express();
var templates = templates || [];
const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: "localhost",
    user: "admin",
    database: "mm_db",
    password: "f7_Yn8ZERsSt_b!",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


 class Record{
    constructor(){       
        return this;            
    }
    //нужно передать соединение с бд 
    async insertDB(connection){        

        let columns = '';
        let values = '';
        for(let column of this._columns){
            columns += column[0] + ', ';
            if(this[column[1]][0]=='('){
                values +=this[column[1]]+', ';
            }else{
                values +='"'+this[column[1]]+'", ';
            }
        }        
        columns=columns.slice(0, -2);
        values=values.slice(0, -2);
        //console.log(columns);
        //console.log(values);
        let queryText = "INSERT INTO "+this._table+"("+columns+") VALUES("+values+")";
        console.log(queryText);
        await connection.execute(queryText);/*,
            function(err, results) {
                if(err) console.log(err);
                else console.log("Данные добавлены");
            });*/
         
     }

     updateDB(connection){
        connection.query("UPDATE "+this._table+" SET mark=? WHERE id=?",
                    [this._mark, this._id_by_billing]/*, 
                    function(err, results) {
                        if(err) console.log(err);
                        else console.log("Данные добавлены");
                    }*/); 
     }

     async getFromDB(connection, table, condition){        
        let resultsFromDB = [];        

        let results = await connection.execute("SELECT * FROM `"+table+"` WHERE " + condition);
        let sum = 0;
        for(let result of results[0]){
            sum++
            //let tiket = new Tiket(result);  
            //console.log(tiket);                              
            resultsFromDB.push(result);
        };
        //console.log(sum);       
        //console.log(resultsFromDB);
        return resultsFromDB;
    }


 }
 
 class Wish extends Record{
    constructor(result){
        super();
        this._wish = result.wish;  
        this._client_id = result.client_id;  
        this._cli=result.cli;      
        this._table = 'wishes';
        this._columns = [['wish', '_wish'],
                            ['user_id', '_cli']
                        ];
        return this;            
    }
 }

 class Phone extends Record{
    constructor(result){
        super();
        this._phone_number = result.phone_number;  
        this._client_id = result.client_id; 
        this._cli=result.cli;               
        this._table = 'phone';
        this._columns = [['phone_number', '_phone_number'],
                            ['user_id', '_cli']
                        ];
        return this;            
    }
 }

 class Tiket extends Record{
    
    //нужно передать строку с JSON
    constructor(result){
        super();
        if(result){
            this._tiket_id = result.tiket_id;
            this._tiket_id_by_billing = (result.tiket_id_by_billing);//?result.tiket_id_by_billing:0;
            this._breakdown = (result.breakdown);//?result.breakdown:0;
            this._tiket_to_do = (result.tiket_to_do);//?result.tiket_to_do:0;
            this._test_ip = result.test_ip;
            this._client_id = (result.client_id);//?result.client_id:0;
            this._employee_id = (result.employee_id);//?result.employee_id:0;
            this._cli=(result.cli);//?result.cli:0;
            this._table = 'tikets';
            this._columns = [['tiket_id_by_billing', '_tiket_id_by_billing'],
                                ['breakdown', '_breakdown'],
                                ['tiket_to_do', '_tiket_to_do'],
                                ['test_ip', '_test_ip'],
                                ['client_id', '_cli'],
                                ['employee_id', '_employee_id'] 
                            ];
        }else{
            this._table = 'tikets';
            this._columns = [['tiket_id_by_billing', '_tiket_id_by_billing'],
                                ['breakdown', '_breakdown'],
                                ['tiket_to_do', '_tiket_to_do'],
                                ['test_ip', '_test_ip'],
                                ['client_id', '_cli'],
                                ['employee_id', '_employee_id'] 
                            ];
        };
        return;
    }

    async getByDays(connection, days){
        let condition = 'time > (CURDATE() - INTERVAL '+days+' DAY) AND time < (CURDATE()- INTERVAL 1 DAY)';
        let asz = await this.getFromDB(connection, this._table, condition);
        //console.log(asz);
        let resultsFromDB = [];
        for(let as of asz){
            let tiket = new Tiket(as);  
            //console.log(tiket);                              
            resultsFromDB.push(tiket);
        }
        return resultsFromDB;
        
    }
    async countByDays(connection, days){
        let arr = await this.getByDays(connection, days);
        return arr.length;
    }

    async countByDaysAndEmployee(connection, days){
        let records = await this.getByDays(connection, days);
        let arr = [];
        let totalTiket_1=0;
        let totalTiket_2=0;
        let totalTiket_3=0;
        let totalTiket_4=0;
        let totalTiket_5=0;
        for(let record of records){
            //console.log(record);
            if(record._employee_id==1){
                totalTiket_1++;
                //console.log(totalTiket_1);
            }else if(record._employee_id==2){
                totalTiket_2++;
                //console.log(totalTiket_1);
            }else if(record._employee_id==3){
                totalTiket_3++;
                //console.log(totalTiket_1);
            }else if(record._employee_id==4){
                totalTiket_4++;
                //console.log(totalTiket_1);
            }else if(record._employee_id==5){
                totalTiket_5++;
                //console.log(totalTiket_1);
            };            
        }  
        arr.push(totalTiket_1);     
        arr.push(totalTiket_2);
        arr.push(totalTiket_3);
        arr.push(totalTiket_4); 
        arr.push(totalTiket_5); 
        return arr;
    }

    async getEmployeeStat(connection){
        let tiket = new Tiket();
        let employeeTiketByMonth = await tiket.countByDaysAndEmployee(connection, 30);
        //console.log(employeeTiketByMonth);
        let employeeTiketByWeek = await tiket.countByDaysAndEmployee(connection, 7);
        //console.log(employeeTiketByWeek);
        let employeeStats = [];
        employeeStats.push({"name": "Маншин Д.", "tiketByMonth": employeeTiketByMonth[0], "tiketByWeek": employeeTiketByWeek[0]});
        employeeStats.push({"name": "Орлов А.", "tiketByMonth": employeeTiketByMonth[1], "tiketByWeek": employeeTiketByWeek[1]});
        employeeStats.push({"name": "Зенин В.", "tiketByMonth": employeeTiketByMonth[2], "tiketByWeek": employeeTiketByWeek[2]});
        employeeStats.push({"name": "Иванов А.", "tiketByMonth": employeeTiketByMonth[3], "tiketByWeek": employeeTiketByWeek[3]});
        employeeStats.push({"name": "Мазур Д.", "tiketByMonth": employeeTiketByMonth[4], "tiketByWeek": employeeTiketByWeek[4]});
        //console.log(employeeStats);
        return employeeStats;    

    }

    async getReplayTikets(connection, days){
        let records = await this.getByDays(connection, days);
        let replayTikets = [];
        let ids = [];
        for(let record of records){
            //console.log(record);
            //SELECT `time` FROM `tikets` WHERE `client_id`="+record._client_id
            let condition = "(`client_id`="+record._client_id+")AND(time > ((SELECT `time` FROM `tikets` WHERE `tiket_id`="+record._tiket_id+") - INTERVAL 31 DAY) )";//AND time < (SELECT `time` FROM `tikets` WHERE `tiket_id`="+record._tiket_id+")
            //console.log(condition);
            let result = await connection.execute("SELECT COUNT(*) FROM `tikets` WHERE " + condition);

            ids.push("");
            //console.log(result[0][0]['COUNT(*)']);
            if(result[0][0]['COUNT(*)']>1){
                let client = new Client();
                let row = await client.getById(connection, record._client_id);
                let flag=0
                
                if(!ids.includes(record._client_id)){
                    //console.log(record._client_id);
                    ids.push(record._client_id);
                    replayTikets.push(row[0])
                }
                
            };
            //let qq = result[0][0]['COUNT(*)'];
                  
        }
        //SELECT COUNT(*) FROM `tikets` WHERE `client_id`='value_1'
        //console.log(replayTikets); 
        return replayTikets;
        
    }
 
 }

 class Client extends Record{    

    constructor(result){
        
        super();
        if(result){
            this._id_by_billing = result.client_id; 
            
            this._client_id = result.client_id;
            this._name = result.name;
            this._address = result.address;
            this._mark = result.mark;
            
            this._table = 'clients';
            this._columns = [['name', '_name'],
                                ['address', '_address'],
                                ['mark', '_mark'],
                                ['id_by_billing', '_id_by_billing']
                            ];
        }else{
            this._table = 'clients';
            this._columns = [['name', '_name'],
                                ['address', '_address'],
                                ['mark', '_mark'],
                                ['id_by_billing', '_id_by_billing']
                            ];
        };
        return;            
    }

    async getById(connection, id){
        let condition = 'id = '+id;
        let clientFromDB = await this.getFromDB(connection, this._table, condition);
        //console.log(clientFromDB);
        return clientFromDB;        
    }

    

 }





 


async function get_analitics(connection,req,res){
    
    let tiket = new Tiket();

    let tiketByMonth = await tiket.countByDays(connection, 30);
    let tiketByWeek = await tiket.countByDays(connection, 7);      
    let employeeStatistik = await tiket. getEmployeeStat(connection);
    //console.log(employeeTiketByMonth);
    
    let replayTikets = await tiket.getReplayTikets(connection, 30)
    //console.log(replayTikets);
               
    
    let resul={"texts": {"replayTikets": replayTikets, 
                        "tiketByMonth": tiketByMonth,
                        "tiketByWeek": tiketByWeek,
                        "employee": employeeStatistik }};
    //console.log(resul);
    generateForm(req,res,'./client/tamplates/analitics.html',resul)

    
    
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
    let ss = "(SELECT id FROM clients WHERE id_by_billing='"+req.body.lsID+"' LIMIT 1)";
    let result = {   
            "client_id":req.body.lsID, 
            "cli": ss,           //result.cli
            "name":req.body.fio,
            "address":req.body.adr,
            "mark":req.body.mark,
            "phone_number":req.body.phone,            
            "tiket_id_by_billing":req.body.tiketID,
            "breakdown":req.body.breakdown,
            "tiket_to_do":req.body.whatToDo,
            "employee_id":req.body.engineer,
            "test_ip":req.ip.substring(7),                
            "wish":req.body.wish,
        }
//    console.log(a);
    let client = new Client(result);
    let tiket = new Tiket(result);
    let phone = new Phone(result);
    let wish = new Wish(result);
    
    client.insertDB(connection);
    tiket.insertDB(connection);
    phone.insertDB(connection);
    wish.insertDB(connection);

    generateForm(req,res,'./client/tamplates/index.html', {'username': 'User',});
});

app.listen(8081);

