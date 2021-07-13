//routes/index.js
//npm install path -g
const path = require('path');
//npm install querystring -g
const querystring = require('querystring');
const biz = require('../dbConfig');
module.exports = function(app){
    //http://127.0.0.1:9001/img
	// app.get('/img', function (req, res) {
	// 	res.sendFile(path.resolve('public/images/movie.8.png'));
	// });
	//加载图片
	//http://127.0.0.1:9001/public/images/movie.8.png
	app.get('/public/images/*',function(req,res){
		//__dirname表示当前文件夹(wxpro/routes/)
		//req.url表示请求的路径/public/images/movie.8.png
		res.sendFile(path.resolve(__dirname,'..' + req.url));
	});
	//http://127.0.0.1:9001/public/music/fhg.mp3
	app.get('/public/music/*',function(req,res){
		res.sendFile(path.resolve(__dirname,'..' + req.url));
	});
	//获取最新期刊数据
	//http://127.0.0.1:9001/getLatest
	app.get('/getLatest',function(req,res){
		let sql = 'select * from classic order by `index` desc limit 0,1';
        biz(sql,[],function(data){
			res.end(JSON.stringify(data[0]));
		});
	});
	//更新点赞状态
	//http://127.0.0.1:9001/like/?nums=737&status=like&index=8
    app.get('/like',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let nums = parseInt(ps.nums);//点赞的次数
        let status = ps.status;//点赞的状态
        status = status === 'like' ? 1 : 0;
        let index = ps.index;//点赞的期刊号
		let sql = 'update classic set fav_nums = ?,like_status = ? where `index` = ?';
		biz(sql,[nums,status,index],function(data){
			res.end();
		});
	});
	//根据期刊号切换期刊数据
	//http://127.0.0.1:9001/getClassic/?index=8&status=prev
	app.get('/getClassic',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
        let index = ps.index;
        let status = ps.status;
		if(status === 'next') {
            index ++;
        } else if(status === 'prev') {
            index --;
        }
		let sql = 'select * from classic where `index` = ?';
		biz(sql,[index],function(data){
            res.end(JSON.stringify(data[0]));
		});
	});
	//获取热门书籍
	//http://127.0.0.1:9001/getHotList
	app.get('/getHotList',function(req,res){
        let sql = 'select t1.*,t2.fav_nums,t2.like_status from book t1,`like` t2 where t1.id = t2.bookid';
		biz(sql,[],function(data){
            res.end(JSON.stringify(data));
		});
	});
	//根据书籍Id获取书籍详情
	//http://127.0.0.1:9001/getBookDetail?bid=7
    app.get('/getBookDetail',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let bid = ps.bid;
        let sql = 'select * from book where id = ?';
		biz(sql,[bid],function(data){
            res.end(JSON.stringify(data[0]));
		});
	});
	//根据书籍id获取书籍评论
	//http://127.0.0.1:9001/getBookComments?bid=7
	app.get('/getBookComments',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let bid = ps.bid;
        let sql = 'select * from comments where bookid = ?';
		biz(sql,[bid],function(data){
            res.end(JSON.stringify(data));
		});
	});
	//根据书籍id获取书籍点赞次数
	//http://127.0.0.1:9001/getBookLike?bid=7
	app.get('/getBookLike',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let bid = ps.bid;
        let sql = 'select * from `like` where bookid = ?';
		biz(sql,[bid],function(data){
            res.end(JSON.stringify(data[0]));
		});
	});
	//根据书籍作者或者标题进行分页查询
	//http://127.0.0.1:9001/query?q=东野圭吾&start=1&pageSize=10
	app.get('/query',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let q = ps.q;
		q = '%' + q + '%';
        let start = parseInt(ps.start);
        let pageSize = parseInt(ps.pageSize);
        let sql = 'select t1.*,t2.fav_nums,t2.like_status from book t1,`like` t2 where t1.id = t2.bookid and author like ? or title like ? limit ?,?';
		biz(sql,[q,q,start,pageSize],function(data){
            res.end(JSON.stringify(data));
		});
	});
	//获取最热门搜索词条
    //http://127.0.0.1:9001/getHot
	app.get('/getHot',function(req,res){
		res.end('{"hot":["Python","哈利·波特","村上春树","东野圭吾","白夜行","韩寒","金庸","王小波"]}');
	});
	//根据书籍Id修改书籍点赞次数和点赞状态
	//http://127.0.0.1:9001/likeBook?bid=7&status=like
    app.get('/likeBook',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		const bid = ps.bid;
        const status = ps.status;
        let sql = 'update `like` set fav_nums = fav_nums '
            + (status === 'like' ? '+' : '-') +' 1,like_status = '
            + (status === 'like' ? 1 : 0) +' where  bookid = ?';
		biz(sql,[bid],function(data){
            res.end(JSON.stringify(data));
		});
	});
	//提交评论
    //http://127.0.0.1:9001/postComment?bid=7&comment=ABC
	app.get('/postComment',function(req,res){
		const ps = querystring.parse(req.url.split('?')[1]);
		let bid = ps.bid;
        let comment = ps.comment;
        //判断表中是否有这条评论
        let sql = 'select count(*) ct from comments where bookid = ? and content = ?';
        biz(sql,[bid,comment],function(data){
            let count = data[0].ct;
			if(count > 0) {
				sql = 'update comments set nums = nums + 1 where bookid = ? and content = ?';
                biz(sql,[bid,comment],function(data){
					res.end(JSON.stringify(data));
				});
			} else {
				sql = 'insert into comments (bookid,content,nums) values(?,?,?)';
                biz(sql,[bid,comment,1],function(data){
					res.end(JSON.stringify(data));
				});
			}
		});
	});
}
