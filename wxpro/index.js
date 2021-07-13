//index.js
let express = require('express');
let app = express();
//中间件
app.use(function(req,res,next){
	if(req.url.search('/public/') === -1) {
        //乱码处理
        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
	}	
	next();
});
//导入路由配置
let routes = require('./routes/index')(app);
app.listen(9001);
console.log('服务器完毕，访问地址http://127.0.0.1:9001/');