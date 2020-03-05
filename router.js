var express = require('express');
var mysql  = require('mysql');
var http=require('http');
var app = express();
var url=require('url');
var fs=require('fs');
var response={};
var Result='';



app.use(express.static('public'));
//监听到客户端连接后，将index.html 发送给客户端显示
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
})

//监听到客户端连接后，进行具体的业务操作（在这里是进行数据库的查找）
//get 得到的客户端的连接，有可能是客户端多种请求连接方式。（在这里是表单提交 给的目标地址 和 GET）
app.get('/restcar.html', function (req, res) {
    // 输出 JSON 格式
    response = {
        "cartype":req.query.cartype
    };

    //创建sql连接对象
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '123',
        port: '3306',
        database: 'db1',
    });

    //连接数据库
    connection.connect();

    //数据库查询语句
    sql = 'SELECT * FROM reserve where cartype="'+response.cartype+'"&&available=true';
    //打印输出语句是否正确
    console.log(sql);
    //请求数据库 开始查询
    function listDic(callback){
        connection.query(sql,function (err, result) {
        if(err){
            //[SELECT ERROR] -  connect ECONNREFUSED 127.0.0.1:3306
            // 原因:  数据库服务没有打开
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        Result=result;
        console.log('------------------------------------------------------------\n\n');
        callback();
        });
    }


    function showPaper(path,status){
        var content = fs.readFileSync(path);
        res.writeHead(status, { 'Content-Type': 'text/html;charset=utf-8' });
        res.write(content);
        res.end();
    }
    listDic(function(){
        if(Result.length!=0)
        {
            console.log(Result.length);
            sql ='UPDATE reserve set available=false WHERE id=(select temp.id from (select * from reserve WHERE cartype="'+response.cartype+'"&& available=true order by id LIMIT 1) as temp)';
            console.log(sql);
            connection.query(sql,function (err, result) {
                if(err){
                    //[SELECT ERROR] -  connect ECONNREFUSED 127.0.0.1:3306
                    // 原因:  数据库服务没有打开
                    console.log('[SELECT ERROR] - ',err.message);
                    return;
                }
                console.log('--------------------------SELECT----------------------------');
                console.log(result);
                Result=result;
                console.log('------------------------------------------------------------\n\n');
                });
            showPaper(__dirname+"/restcar.html",200);
        }
        else
        {
            console.log(Result.length);
            showPaper(__dirname+"/404.html",404);
        }
        //中断数据库的连接
    
        connection.end();
    });
    
    //res.end(JSON.stringify(response));
})

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("We are connecting to http://%s:%s", host, port)
})