const mongoose = require('mongoose')


var userSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    image : {
        data : Buffer,
        contentType : String
    }
})

module.exports = new mongoose.model('User', userSchema);