var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var post = {
      name: this.name,
      time: time,
      title: this.title,
      post: this.post
  };
  // 打开数据库
  mongodb.connect(mongodb.url, { useNewUrlParser: true }, function(err, db) {
    if (err) return callback(err);
    console.log("数据库已创建1!");
    // post 集合
    var dbase = db.db("blog");
    dbase.createCollection('posts', function (err, res) {
      if (err) return callback(err);
      console.log("创建集合1!");
    });
    // 插入post数据
    dbase.collection("posts").insertOne(post, function(err, res) {
        if (err) return callback(err);
        console.log("文档插入成功");
        console.log(res);
        callback(null, res[0]);
    });
    db.close();
  });


  //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //将文档插入 posts 集合
  //     collection.insert(post, {
  //       safe: true
  //     }, function (err) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);//失败！返回 err
  //       }
  //       callback(null);//返回 err 为 null
  //     });
  //   });
  // });
};

//读取文章及其相关信息
Post.get = function(name, callback) {
  // 打开数据库
  mongodb.connect(mongodb.url, { useNewUrlParser: true }, function(err, db) {
    if (err) return callback(err);
    console.log("数据库已创建2!");
    //读取 posts 集合
    var dbase = db.db("blog");
    // dbase.createCollection('users', function (err, res) {
    //   if (err) return callback(err);
    //   console.log("创建集合2!");
    // });
    // 在posts中查找
    var whereStr = {"name":name};  // 查询条件
    dbase.collection("posts"). find(whereStr).sort({time:-1}).toArray(function(err, result) { // 返回集合中所有数据
        if (err){
          return callback(err);
        }
        console.log(result);
        //解析 markdown 为 html
        result.forEach(function (doc) {
          doc.post = markdown.toHTML(doc.post);
        });
        callback(null, result);//成功！返回查询的文档
    });
    db.close();
  });

  //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function(err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     var query = {};
  //     if (name) {
  //       query.name = name;
  //     }
  //     //根据 query 对象查询文章
  //     collection.find(query).sort({
  //       time: -1
  //     }).toArray(function (err, docs) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);//失败！返回 err
  //       }
  //       callback(null, docs);//成功！以数组形式返回查询的结果
  //     });
  //   });
  // });
};