var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

/* GET home page. */
router.get('/', function (req, res) {
	// 检测登录
	var username = null;
	if (req.session.user) {
	    username = req.session.user.name;
  	}
	Post.get(username, function (err, posts) {
	    if (err) {
	    	console.log(err);
	      posts = [];
	    } 
	    res.render('index', {
	      title: '主页',
	      user: req.session.user,
	      posts: posts,
	      success: req.flash('success').toString(),
	      error: req.flash('error').toString()
	    });
	});
});
router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
	res.render('reg', { 
		title: '注册' ,
		user: req.session.user,
	    success: req.flash('success').toString(),
	    error: req.flash('error').toString()
	});
});

router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
	var name = req.body.name,
	      password = req.body.password,
	      password_re = req.body['password-repeat'];
	  //检验用户两次输入的密码是否一致
	  if (password_re != password) {
	    req.flash('error', '两次输入的密码不一致!'); 
	    return res.redirect('/reg');//返回注册页
	  }
	  //生成密码的 md5 值
	  var md5 = crypto.createHash('md5'),
	      password = md5.update(req.body.password).digest('hex');
	  var newUser = new User({
	      name: name,
	      password: password,
	      email: req.body.email
	  });
	  //检查用户名是否已经存在 
	  User.get(newUser.name, function (err, user) {
	  	console.log(!user[0]);
	    if (err) {
	      req.flash('error', err);
	      return res.redirect('/');
	    }
	    if (user[0]) {
	      req.flash('error', '用户已存在!');
	      return res.redirect('/reg');//返回注册页
	    }
	    //如果不存在则新增用户
	    newUser.save(function (err, user) {
	      if (err) {
	        req.flash('error', err);
	        return res.redirect('/reg');//注册失败返回主册页
	      }
	      req.session.user = newUser;//用户信息存入 session
	      req.flash('success', '注册成功!');
	      res.redirect('/');//注册成功后返回主页
	    });
	  });
});

router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
	res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    }); 
});

router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
	var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');

    User.get(req.body.name, function (err, user) {
      if (+user==0) {
        req.flash('error', '用户不存在!'); 
        return res.redirect('/login');
      }
      if (user[0].password != password) {
        req.flash('error', '密码错误!'); 
        return res.redirect('/login');
      }
      req.session.user = user[0];
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
});

router.get('/post', checkLogin);
router.get('/post', function (req, res) {
	res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
});

router.post('/post', checkLogin);
router.post('/post', function (req, res) {
  var currentUser = req.session.user,
  post = new Post(currentUser.name, req.body.title, req.body.post);
  post.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
	req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
});

// 路由中间件
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录!'); 
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录!'); 
    res.redirect('back');//返回之前的页面
  }
  next();
}



module.exports = router;
