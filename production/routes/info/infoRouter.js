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
                    // console.log('111')
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
                            // console.log(doc)
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
        // console.log(user)
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
                console.log('query')
                var reg=new RegExp(query,'i');
                login.find(
                    {
                        $or:[
                            {ShortName:{$regex:reg}},
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
                            if(user.length<=0)
                            {
                                    console.log('111')
                                    login.find({},{
                                        contributes:{
                                            $elemMatch:{
                                                duty:reg
                                            }
                                        }
                                    },(err,user)=>{
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
                                                var result=[];
                                                var newUser=user.filter((v,i)=>{
                                                    if(v.contributes&&v.contributes.length>0){
                                                        console.log('1111')
                                                        result.push(v.contributes);
                                                        
    
                                                    }
                                                 })
                                                
                                                 console.log(result)
                                                 if(result.length>0){
                                                     return res.json({
                                                         code:200,
                                                         msg:'信息来了'
                                                     })
                                                 }else{
                                                     return res.json({
                                                         code:404,
                                                         msg:'没有信息',
                                                         data:[]
                                                     })
                                                 }
                                        }
                                    }) 
                                    // 这一段废了。。。。  
                            }
                            else 
                            {
                                
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
})

router.post('/giveGood',(req,res)=>{
    let givePerson=req.body.from;
    let getPerson=req.body.to;

    async.waterfall([
        function(done){
            login.findOne({ShortName:givePerson},['Give','GiveNumber'],(err,infos)=>{
                if(err){
                    return res.json({
                        code:404,
                        msg:'你要点赞的人只存在时间缝隙中'
                    })
                }else{
                    console.log(infos);
                    let {GiveNumber,Give}=infos;
                    var updateGood={};
                    if(Give.includes(getPerson)){
                        return res.json({
                            code:404,
                            msg:'之前被点过'
                        })
                    }else{
                        Give.push(getPerson);
                        GiveNumber++;
                        updateGood.Give=Give;
                        updateGood.GiveNumber=GiveNumber;
                        infos.update(updateGood,(err,ok)=>{
                            if(err){
                                return res.json({
                                    code:404,
                                    msg:"你要点赞的人只存在时间缝隙中"
                                })
                            }else{
                                done(null,ok)
                            }
                        })
                    }
                   
                }
            })
        },function(result,done){
            console.log('11111')
            if(result.ok==1){
                login.findOne({ShortName:getPerson},['Get','GetNumber'],(err,infos)=>{
                    if(err){
                        return res.json({
                            code:404,
                            msg:"你要点赞的人只存在时间缝隙中"
                        }) 
                    }else{
                        let {GetNumber,Get}=infos;
                        var updateGood={};
                        if(Get.includes(givePerson)){
                            return res.json({
                                code:200,
                                msg:'之前已经点过了'
                            })
                        }else{
                            Get.push(givePerson);
                            GetNumber++;
                            updateGood.Get=Get;
                            updateGood.GetNumber=GetNumber;
                            infos.update(updateGood,(err,ok)=>{
                                if(err){
                                    return res.json({
                                        code:404,
                                        msg:"你要点赞的人只存在时间缝隙中"
                                    })
                                }else{
                                    done(null,ok)
                                }
                            })
                        }
                    }
                })
            }else{
                return res.json({
                    code:404,
                    msg:'你要点赞的人只存在时间缝隙中'
                })
            }
        }
    ],(err,result)=>{
        if(err){
            console.log('errr')
            return res.json({
                msg:'点赞失败',
                code:404
            })
        }else{
            if(result.ok===1){
                return res.json({
                    code:200,
                    msg:'点赞成功'
                })
            }else{
                return res.json({
                    code:404,
                    msg:'点赞失败'
                })
            }
        }
    })  
})

// 
router.post('/giveNumber',(req,res)=>{

    login.findOne({ShortName:req.body.query},['GiveNumber'],(err,num)=>{
        if(err){
            return res.json({
                code:404,
                msg:"获取数据错误"
            })
        }else{
            return res.json({
                code:200,
                data:num
            })
        }
    })
})

router.post('/giveGet',(req,res)=>{
    console.log(req.body.query);
    login.findOne({ShortName:req.body.query},['Give'],(err,num)=>{
        if(err){
            return res.json({
                code:404,
                msg:"获取数据错误"
            })
        }else{
            return res.json({
                code:200,
                data:num
            })
        }
    })
})

router.post('/getGet',(req,res)=>{
    console.log(req.body.query);
    login.findOne({ShortName:req.body.query},['Get'],(err,num)=>{
        if(err){
            return res.json({
                code:404,
                msg:"获取数据错误"
            })
        }else{
            return res.json({
                code:200,
                data:num
            })
        }
    })
})

router.post('/getNumber',(req,res)=>{
    console.log(req.body.query);
    login.findOne({ShortName:req.body.query},['GetNumber'],(err,num)=>{
        if(err){
            return res.json({
                code:404,
                msg:"获取数据错误"
            })
        }else{
            return res.json({
                code:200,
                data:num
            })
        }
    })
})


// 消除点赞
router.post('/deleteGood',(req,res)=>{
    console.log(req.body.from)

    let givePerson=req.body.from;
    let getPerson=req.body.to;

    async.waterfall([
        function(done){
            login.findOne({ShortName:givePerson},['Give','GiveNumber'],(err,infos)=>{
                if(err){
                    return res.json({
                        code:404,
                        msg:'你要点赞的人只存在时间缝隙中'
                    })
                }else{
                    
                    let {GiveNumber,Give}=infos;
                    var updateGood={};
                    if(Give.includes(getPerson)){
                        console.log('111');
                        let index=Give.findIndex((value,index,err)=>{
                            return value===getPerson
                        })

                        console.log(index)
                        Give.splice(index,1);
                        console.log(Give)

                        GiveNumber--;
                        updateGood.Give=Give;
                        updateGood.GiveNumber=GiveNumber;
                        infos.update(updateGood,(err,ok)=>{
                            if(err){
                                return res.json({
                                    code:404,
                                    msg:"你要取消赞的人只存在时间缝隙中"
                                })
                            }else{
                                done(null,ok)
                            }
                        })   
                    }else{
                        return res.json({
                            code:404,
                            msg:'这个人不存在'
                        })
                    }
                   
                }
            })
        },
        function(result,done){
            if(result.ok==1){
                login.findOne({ShortName:getPerson},['Get','GetNumber'],(err,infos)=>{
                    if(err){
                        return res.json({
                            code:404,
                            msg:"你要取消赞的人只存在时间缝隙中"
                        }) 
                    }else{
                        let {GetNumber,Get}=infos;
                        var updateGood={};
                        if(Get.includes(givePerson)){
                           
                            let index=Get.findIndex((value,index,err)=>{
                                return value===givePerson
                            })
                            console.log(index)
                            Get.splice(index,1);
                            console.log(Get)
                            GetNumber--;
                            updateGood.Get=Get;
                            updateGood.GetNumber=GetNumber;
                            infos.update(updateGood,(err,ok)=>{
                                if(err){
                                    return res.json({
                                        code:404,
                                        msg:"你要消除赞的人只存在时间缝隙中"
                                    })
                                }else{
                                    done(null,ok)
                                }
                            })
                        }else{
                            return res.json({
                                code:200,
                                msg:'之前已经取消过了'
                            })
                        }
                    }
                })
            }else{
                return res.json({
                    code:404,
                    msg:'你消除赞的人只存在时间缝隙中'
                })
            }
        }
    ],(err,result)=>{
        if(err){
            console.log('errr')
            return res.json({
                msg:'取消赞失败',
                code:404
            })
        }else{
            if(result.ok===1){
                return res.json({
                    code:200,
                    msg:'取消赞成功'
                })
            }else{
                return res.json({
                    code:404,
                    msg:'取消赞失败'
                })
            }
        }
    })  
})
module.exports=router;