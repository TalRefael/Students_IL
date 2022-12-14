const express = require('express')
const app = express();
var path = require('path');
var cons = require('consolidate');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Student = require('./models/student');
const hr = require('./models/hr');


app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }))


const dbURI = "mongodb+srv://StudentsIL:StudentsIL1234@students.ocwlk3a.mongodb.net/users?retryWrites=true&w=majority"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));
var db = mongoose.connection


app.get('/', (req, res) => {
    res.render('enter')
    res.statusCode=200
})
app.get('/enter', (req, res) => {
    res.render('enter')
})

app.get('/chooseprofile', (req, res) => {
    res.render('chooseprofile')
})

app.get('/hr', (req, res) => {
    res.render('hr')
})

app.get('/student', (req, res) => {
    res.render('student')
})

app.get('/afterSingup', (req, res) => {
    res.render('afterSingup')
})

app.get('/porggot', (req, res) => {
    res.render('porggot')
})

app.get('/newpass', (req, res) => {
    res.render('newpass')
})

app.get('/job-portal-website-template', (req, res) => {
    res.render('job-portal-website-template')
})


// signup hr
app.post('/hr', async (req, res) => {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    db.collection('hrs').insertOne({
        firstname: req.body.firstname,
        secondname: req.body.secondname,//json.toString(req.body.birthdate),
        email: req.body.email,
        companyname: req.body.companyname,
        phone: req.body.phone,
        security: req.body.security,
        password: req.body.password,
    });
    res.redirect('/enter')
});

//signup student
app.post('/student', async (req, res) => {
    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    db.collection('students').insertOne({
        firstname: req.body.firstname,
        secondname: req.body.secondname,//json.toString(req.body.birthdate),
        email: req.body.email,
        phone: req.body.phone,
        security: req.body.security,
        password: req.body.password,
    })
    res.redirect('/enter')
});

app.post('/agent', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    db.collection('agents').insertOne({
        firstname: req.body.firstname,
        secondname: req.body.secondname,//json.toString(req.body.birthdate),
        email: req.body.email,
        phone: req.body.phone,
        security: req.body.security,
        password: hashedPassword,
    })
    res.redirect('/enter')
});





//login student
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body)
    try {
        db.collection('students').findOne({ email: email })
            .then((user) => {
                if (user) {
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (err) {
                            console.log(err)
                        }

                        if(result){                                   
                            console.log('in index')
                            res.redirect('/index')
                            res.end()
                        } else {
                            console.log("login failed")
                            res.send("login failed")
                            
                        }
                    })
                }
                else{
                    db.collection('hrs').findOne({ email: email })
                    .then((user) => {
                        if (user) {
                            bcrypt.compare(password, user.password, (err, result) => {
                                if (err) {
                                   console.log(err)
                                }
                                if(result){                                   
                                    console.log('in hr');
                                    res.redirect('/indexhr');
                                    res.end()
                                } else {
                                    console.log("login failed")
                                    res.send("login failed")
                                    
                                }
        
                            })
                        }
                        else{
                            db.collection('agents').findOne({ email: email })
                            .then((user) => {
                                if (user) {
                                    bcrypt.compare(password, user.password, (err, result) => {
                                        if (err) {
                                           console.log(err)
                                        }
                                        if(result){                                   
                                            console.log('in agent');
                                            res.redirect('/index_agent');
                                            res.end()
                                        } else {
                                            console.log("login failed")
                                            res.send("login failed")
                                            
                                        }
                
                                    })
                                }
                                
                                else {
                                    console.log("login failed")
                                    res.send("login failed, cant find user with that email")
                                }
                            })
                        }


                    })

                } 
           
            })
    }
    catch {
        res.redirect('/error')
    }
})


app.get('/index', (req, res) => {
    res.render('index')
})
app.get('/index_agent', (req, res) => {
    res.render('index_agent')
})


app.get('/indexhr', (req, res) => {
    res.render('indexhr')
})

app.get('/agenttostudent', (req, res) => {
    res.render('agenttostudent')
})

app.get('/agenttoHR', (req, res) => {
    res.render('agenttoHR')
})

app.get('/hrcontact', (req, res) => {
    res.render('hrcontact')
})

app.get('/job-detail', (req, res) => {
    res.render('job-detail')
})

app.listen(3000, () => {
    console.log("listennung to port 3000")
});

module.exports = app

