var express=require('express');
var {login}=require('../../db/module.js');
var {good}=require('../../db/module.js');
var mongoose=require('mongoose');
var async=require('async');
var router=express.Router();
// 进行配置文件的读取

var fs=require('fs');


var fsWatch=fs.watch('./config/search.json',(event,filename)=>{
    console.log('文件发生变化');
})
fsWatch.on('change',(event,filename)=>{
    console.log('文件发生了变化')

})
// function getJson(){
//     async.waterfall([
//         function(done){
//             console.log('111')
//             let stream=fs.createReadStream('./config/search.json')
//             let data="";


//             stream.on('data',(chrunk)=>{
//                 data+=chrunk;
//             })
//             stream.on('end',()=>{
//               let result=JSON.parse(data);
//               done(null,result)
//             })
        
//         }
//     ],(err,result)=>{
//         if(err){
//             console.log('配置文件读取错误')
//         }else{
//             console.log(result);
//             console.log('stand1'+stand)
//             stand=result.stand;
//         }
//     })
//     console.log('stand2'+stand)
// }
// getJson()

// console.log('stand3'+stand)




router.post('/test',function(req,res){
   
    let data="";
    var start;
    var pageSize=8;
    var sortOptions={
        Age:-1,
        Visit:-1
    }
    // console.log(sort);
    var page=req.body.page;
    if(!page){
        start=0
    }else{
        start=(page-1)*pageSize;
    }

    async.parallel({
        count:function(done){
            login.count({}).exec((err,count)=>{
                done(err,count);
            })
        },

        data:function(done){
            login.find({},
                            ['Domain','IndexShowPhotograph','Signature','Department','Job','Visit','EName','PhoneNumber','ShortName','FullName','IndexShowPhotograph',])
                            .skip(start)
                            .limit(pageSize)
                            .sort(sortOptions)
                            .exec((err,doc)=>{
                                done(err,doc)
                            })
        }

    },(err,result)=>{
        if(err){
            console.log(err)
        }else{
            console.log(result)
            let allPage=Math.ceil((result.count)/pageSize)
            return res.json({
                allPage:allPage,
                currentPage:page,
                data:result.data
                // msg:'haha'
            })
        }
    })



    
})
// 首页请求。

router.post('/indexShow',(req,res)=>{
    var start;
    var page=req.body.page;
    async.waterfall([
                function(done){
                    console.log('111')
                    let stream=fs.createReadStream('./config/search.json')
                    let data="";
        
        
                    stream.on('data',(chrunk)=>{
                        data+=chrunk;
                    })
                    stream.on('end',()=>{
                      let result=JSON.parse(data);
                      done(null,result)
                    })
                
                },function(result,done){
                    let pageSize=result.pageSize;
                    if(!page){
                        start=0
                    }else{
                        start=(page-1)*pageSize;
                    }
                    result.start=start;
                    done(null,result);
                },function(result,done){
                    login.count({}).exec((err,count)=>{
                      if(err){
                          return res.json({
                              msg:'数据库查找错误'
                          })
                      }else{
                          result.count=count;
                          done(null,result);
                      }
                    })
                },function(result,done){
                    // console.log(result)
                    let {sortOptions,count,pageSize,start}=result;
                    // console.log(pageSize)
                    login.find({FullName:/[\s\S]/},
                        ['Domain','IndexShowPhotograph','Signature','Department','Job','Visit','EName','PhoneNumber','ShortName','FullName','IndexShowPhotograph',])
                        .skip(start)
                        .limit(pageSize)
                        .sort(sortOptions)
                        .exec((err,doc)=>{
                            console.log(doc)
                            var findResult={}
                            findResult.data=doc;
                            findResult.currentPage=page;
                            let allPage=Math.ceil((result.count)/pageSize)
                            findResult.allPage=allPage;
                            done(null,findResult) 
                        })
                }
            ],(err,findResult)=>{
                if(err){
                    return res.json({
                        msg:'读取配置文件错误',
                        code:404,
                    })
                }else{
                    return res.json({
                       info:findResult,
                       code:200,
                    })
                }
            })
})
// function shuffle(a) {
//     var len = a.length;
//     for (var i = 0; i < len - 1; i++) {
//         var index = parseInt(Math.random() * (len - i));
//         var temp = a[index];
//         a[index] = a[len - i - 1];
//         a[len - i - 1] = temp;
//     }
// }
// 部门请求
router.post('/department',function(req,res){
   var query=req.body.query
   var reg=new RegExp(query,'i');
   login.find({Domain:reg},(err,user)=>{
       if(err){
        return res.json({
            msg:'这个部门的人消失在了时间缝隙中！',
            code:404
        })
       }
       if(user.length){
        console.log(user)
            return res.json({
                code:200,
                data:user,
                msg:'hahah'
            })
       }else{
            return res.json({
                msg:'这个部门的人消失在了时间缝隙中！',
                code:404
            })
       }
   })
})

// 模糊查询
router.post('/search',function(req,res){
    var query=req.body.query;
    if(query){
        var reg=new RegExp(query,'i');
    // var duty=contributes.duty;
     login.find(
        {
            $or:[
                // {shortName:{$regex:reg}},
                {CName:{$regex:reg}},
                {EName:{$regex:reg}},
                {Job:{$regex:reg}},
                {HireDate:{$regex:reg}},
                {Sex:{$regex:reg}},
                {IsWork:{$regex:reg}},
                {IsSingle:{$regex:reg}},
                {Hometown:{$regex:reg}},
                {Signature:{$regex:reg}},
                {Country:{$regex:reg}},
                {Age:{$regex:reg}},
                {Deparent:{$regex:reg}},
                {Email:{$regex:reg}},
                {PhoneNumber:{$regex:reg}},
                {Company:{$regex:reg}},
                // 简单的字符串查找
                {Domain:{$regex:reg}},

                // 数组内进行查找
                 {Hobbies:{$regex:reg}},
                 {Skills:{$regex:reg}},
                 {Tags:{$regex:reg}},
                 
                // 数组里面的对象内进行查找
                 {Contributes:{
                        $elemMatch:{
                            duty:reg
                        }
                     }
                 }    
            ]
        },{
            _id:0
            // 不返回的东西
        }
    ).exec((err,user)=>{
        
        if(err){
           return res.json({
               code:200,
               msg:'可能没有值返回'
           })
        }else{
           if(user.length<=0){
          
                login.find({},{
                    contributes:{
                        $elemMatch:{
                            // duty:'啥，吃了一个大披萨'
                            duty:reg
                        }
                        // 注意
                        // 1：数组中元素是内嵌文档，
                        // 2：如果多个元素匹配￥elemMatch条件操作符返回第一个匹配条件的元素。


                    }
                },(err,user)=>{
                    console.log('1')
                    console.log(user)
                    if(err){
                        return res.json({
                            code:404,
                            msg:'查找出错',
                        })
                    }
                    if(user.length==1){
                        return res.json({
                            code:404,
                            msg:'没有信息'
                        })
                    }else{
                       var newUser=user.filter((v,i)=>{
                             var result=[];
                          if(v.contributes&&v.contributes.length>0){
                              result.push(v.contributes);
                              
                              return res.json({
                                data:result
                              })
                          } 
                       })
                    }
                }) 
                // 这一段废了。。。。  
           }else{
               return res.json({
                data:user,
                msg:'信息来了'
            })
           }
        }
    })
    }else{
        return res.json({
            code:200,
            msg:'啥都没有'
        })
    }
    // var reg=new RegExp(query,'i');
    // // var duty=contributes.duty;
    //  login.find(
    //     {
    //         $or:[
    //             // {shortName:{$regex:reg}},
    //             {CName:{$regex:reg}},
    //             {EName:{$regex:reg}},
    //             {Job:{$regex:reg}},
    //             {HireDate:{$regex:reg}},
    //             {Sex:{$regex:reg}},
    //             {IsWork:{$regex:reg}},
    //             {IsSingle:{$regex:reg}},
    //             {Hometown:{$regex:reg}},
    //             {Signature:{$regex:reg}},
    //             {Country:{$regex:reg}},
    //             {Age:{$regex:reg}},
    //             {Deparent:{$regex:reg}},
    //             {Email:{$regex:reg}},
    //             {PhoneNumber:{$regex:reg}},
    //             {Company:{$regex:reg}},
    //             // 简单的字符串查找

    //             // 数组内进行查找
    //              {Hobbies:{$regex:reg}},
    //              {Skills:{$regex:reg}},
    //              {Tags:{$regex:reg}},
                 
    //             // 数组里面的对象内进行查找
    //              {Contributes:{
    //                     $elemMatch:{
    //                         duty:reg
    //                     }
    //                  }
    //              }    
    //         ]
    //     },{
    //         _id:0
    //         // 不返回的东西
    //     }
    // ).exec((err,user)=>{
        
    //     if(err){
    //        return res.json({
    //            code:200,
    //            msg:'可能没有值返回'
    //        })
    //     }else{
    //        if(user.length<=0){
          
    //             login.find({},{
    //                 contributes:{
    //                     $elemMatch:{
    //                         // duty:'啥，吃了一个大披萨'
    //                         duty:reg
    //                     }
    //                     // 注意
    //                     // 1：数组中元素是内嵌文档，
    //                     // 2：如果多个元素匹配￥elemMatch条件操作符返回第一个匹配条件的元素。


    //                 }
    //             },(err,user)=>{
    //                 console.log('1')
    //                 console.log(user)
    //                 if(err){
    //                     return res.json({
    //                         code:404,
    //                         msg:'查找出错',
    //                     })
    //                 }
    //                 if(user.length==1){
    //                     return res.json({
    //                         code:404,
    //                         msg:'没有信息'
    //                     })
    //                 }else{
    //                    var newUser=user.filter((v,i)=>{
    //                          var result=[];
    //                       if(v.contributes&&v.contributes.length>0){
    //                           result.push(v.contributes);
                              
    //                           return res.json({
    //                             data:result
    //                           })
    //                       } 
    //                    })
    //                 }
    //             }) 
    //             // 这一段废了。。。。  
    //        }else{
    //            return res.json({
    //             data:user,
    //             msg:'信息来了'
    //         })
    //        }
    //     }
    // })
})

router.post('/good',(req,res)=>{
    // console.log(req.body)
    var _good=new good(req.body);
    _good.save((err,response)=>{
        if(err){
            return res.json({
                msg:'点赞失败',
                code:404,
            })
        }else{
            return res.json({
                msg:'点赞成功',
                code:200,
            })
        }
    })
})

router.post('/getGood',(req,res)=>{
    var query=req.body.query;

    var reg=new RegExp(query,'i');
    good.find({to:reg},(err,user)=>{
        if(err){
            return res.json({
                msg:'查询失败',
                code:404
            })
        }else{
            return res.json({
                data:user,
                code:200
            })
        }
    })
})

router.post('/setGood',(req,res)=>{
    var query=req.body.query;

    var reg=new RegExp(query,'i');
    good.find({from:reg},(err,user)=>{
        if(err){
            return res.json({
                msg:'查询失败',
                code:404
            })
        }else{
            return res.json({
                data:user,
                code:200
            })
        }
    }) 
})

module.exports=router;