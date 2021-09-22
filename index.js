const express = require('express');
const bodyparser  = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const multer = require('multer');
const path = require('path')
const fs = require('fs')

const database = require('./config/database');




app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));


mongoose.connect(database.url, (err,result) => {
    if(err) throw err;
    console.log('Database conected')
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var upload = multer({ storage: storage });

var userModel = require('./model/user');

app.get('/form',(req,res) => {
    res.render('form');
})

app.post('/save',upload.single('image'), (req,res,next) => {

    var obj = {
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        image : {
            data : fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType : 'image/png'
        } 
    }

    userModel.create(obj, (err, result) => {
        if(err) throw err;
        result.save();
        res.redirect('/');
    })
})

app.get('/', (req,res) => {
    userModel.find({}, (err,results) => {
        if(err) throw err;

        res.render('view',{
            results:results
        })
    })
})

app.get('/edit/:id', (req,res) => {
    var id = req.params.id;

    userModel.findById(id, (err,result) => {
        if(err) throw err;

        res.render('user_edit', {
            user:result
        })
    })
})

app.post('/update',upload.single('image'), (req,res) => {

    var id = req.body.id;

    if((req.file))
    {
        var obj = {
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
            image : {
                data : fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                contentType : 'image/png'
            } 
        }
    }
    else
    {
        var obj = {
            name : req.body.name,
            email : req.body.email,
            password : req.body.password,
        }
    }
    console.log(id)
    console.log(obj)

    var update = userModel.findByIdAndUpdate(id,obj);

    update.exec((err,data) => {
        if(err) throw err;
        res.redirect('/');
    })

})

app.get('/delete/:id', (req,res) => {
    var id = req.params.id;
    console.log(id);

    userModel.deleteOne({_id : id}).exec((err,result) => {
        if(err) throw err;
        res.redirect('/');
    })


})

app.listen(3000, () => {
    console.log('App is running on port 3000');
});