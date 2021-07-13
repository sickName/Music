const mysql = require('mysql');
module.exports = function(sql,ps,cb){
    const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'yqyt',
        port: 3306,
        database: 'test'
    });
    conn.connect();
    conn.query(sql,ps,function(err,rs){
        if(err) {
            console.log(err.message);
            return;
        }
        cb(rs);
    });
    conn.end();
}