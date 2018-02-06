let mongoose=require('mongoose');

let goodSchema=new mongoose.Schema({
    from:{
        type:String,
        require:true,
    },
    to:{
        type:String,
        require:true,
    }
})
module.exports=goodSchema;