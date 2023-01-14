const express = require('express')
const app = express();
var path = require('path');
var cons = require('consolidate');
var Binary = require('mongodb').Binary;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Student = require('./models/student');
const hr_interview = require('./models/hr_interview');
const hr = require('./models/hr');
const job = require('./models/job');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const agent_student = require('./models/agent_student');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const multer = require('multer');
const Grid = require('gridfs-stream');
const crypto = require('crypto');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


const dbURI = "mongodb+srv://StudentsIL:StudentsIL1234@students.ocwlk3a.mongodb.net/users?retryWrites=true&w=majority"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));
var db = mongoose.connection

// Init gfs
let gfs
let session
const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });

app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24
app.use(sessions({
    secret: 'secret',
    cookie: { maxAge: oneDay },
    resave: false,
    saveUninitialized: true
}))


db.once('open', () => {
    // Init stream
    gfs = Grid(db, mongoose.mongo);
    gfs.collection('uploads');
});

app.use(express.urlencoded({ extended: false }))

//אחראי על העלאת קורות חיים למונגו
const storage = new GridFsStorage({
    url: dbURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                // const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: file.originalname,
                    bucketName: 'uploads',
                };

                resolve(fileInfo);
            });
        });

    }

});
const upload = multer({ storage });

// קריאה של קורות חיים של מועמד לפי תעודת הזהות שלו בדף התראות
app.post('/notifications_HR/:filename', (req, res) => {
    const filename = req.params.filename
    gfs.files.findOne({ filename: filename }, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Read output to browser
        const readstream = bucket.openDownloadStreamByName(file.filename)
        readstream.pipe(res);

    });
});

//הצהרה של עמוד התראות מגייס והוספת מערכי ההתראות לעמוד 
app.get('/notifications_HR', (req, res) => {
    const email = session.userid
    hr.findOne({ email: email })
        .then(result => {
            if (result) {
                const arr = db.collection('agents_to_hrs');
                arr.find().toArray((err, Agents_to_hrs) => {
                    res.render('notifications_HR', { Jobs: result.clients, email: session.userid, Agents_to_hrs: Agents_to_hrs })
                })
            }
        })
});

//הצהרה של עמוד לחיפוש עבודה לפי קטריונים שונים
app.get('/search_job', (req, res) => {
    const arr = db.collection('jobs');
    Student.findOne({ email: session.userid })
        .then(result => {
            if (result) {
                arr.find().toArray((err, Jobs) => {
                    res.render('search_job', { user: result, Jobs: Jobs })
                })
            }
        })
})

// הצהרה של עמוד דף בית לסטונדט והוספת כלל העבודות שנוספו על ידי מגייסים שונים
app.get('/index', (req, res) => {
    if (session) {
        const email = session.userid
        Student.findOne({ email: email })
            .then(result => {
                if (result) {
                    const arr = db.collection('jobs');
                    arr.find().toArray((err, Jobs) => {
                        res.render('index', { Jobs: Jobs, user: result.id_number })
                    })
                }
            })
    }
    else {
        res.redirect('/enter')
    }
})

//הצהרה של עמוד התראות סוכן והוספת מערכי ההתראות לעמוד 

app.get('/notifications_agent', (req, res) => {
    const arr = db.collection('students_to_agents')
    arr.find().toArray((err, Students_to_agents) => {
        const hrRef = db.collection('hrs_to_agents')

        hrRef.find().toArray((err, Hrs_to_agents) => {
            res.render('notifications_agent', { Students_to_agents: Students_to_agents, Hrs_to_agents: Hrs_to_agents })
        })
    })
})


//הצהרה של עמוד התראות סטודנט והוספת מערכי ההתראות לעמוד 

app.get('/notifications_student', (req, res) => {
    const email = session.userid
    Student.findOne({ email: email })
        .then(result => {
            if (result) {
                const arr = db.collection('agent_to_student');
                arr.find().toArray((err, Agents_to_students) => {
                    const hrRef = db.collection('interviews')

                    hrRef.find().toArray((err, interviews) => {
                        res.render('notifications_student', { email: session.userid, Agents_to_students: Agents_to_students, interviews: interviews, user: result.id_number })
                    })
                })
            }
        })



})

// הצהרה של דף בית של מגייס הוספת מערכי המשרות הספציפיות של אותו מגייס 
app.get('/indexhr', (req, res) => {
    const email = session.userid
    hr.findOne({ email: email })
        .then(result => {
            res.render('indexhr', { jobs: result.myjobs });
        })

})

// הצהרה של דף בית של משרות מועדפות והוספת מערכי המשרות המועדפות של אותו סטודנט 
app.get('/favorite', (req, res) => {
    const email = session.userid
    Student.findOne({ email: email })
        .then(result => {
            if (result) {
                res.render('favorite', { user: result.id_number, Jobs: result.favjobs });

            }
        })

})


app.get('/', (req, res) => {
    res.render('enter')
})
app.get('/enter', (req, res) => {
    res.render('enter')

})
app.get('/update_job', (req, res) => {
    res.render('update_job')

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

app.get('/hrcontact', (req, res) => {
    res.render('hrcontact')
})
app.get('/studentcontact', (req, res) => {
    res.render('studentcontact')
})

app.get('/choosedetailes', (req, res) => {
    res.render('choosedetailes')
})

app.get('/job-portal-website-template', (req, res) => {
    res.render('job-portal-website-template')
})

app.get('/changestudentprofile', (req, res) => {
    res.render('changestudentprofile')
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
app.get('/studentcontact', (req, res) => {
    res.render('studentcontact')
})

app.get('/CV', (req, res) => {
    res.render('CV')
})
app.get('/job-detail', (req, res) => {
    res.render('job-detail')
})

app.get('/choosedetails', (req, res) => {
    res.render('choosedetails')
})

app.get('/notifications_agent', (req, res) => {
    res.render('notifications_agent')
})

app.get('/interview', (req, res) => {
    res.render('interview')
})

app.get('/index_agent', (req, res) => {
    res.render('index_agent')
})
app.get('/changestudentprofile', (req, res) => {
    res.render('changestudentprofile')
})



// הרשמה לאתר בתור מגייס
app.post('/hr', async (req, res) => {
    db.collection('hrs').insertOne({
        firstname: req.body.firstname,
        secondname: req.body.secondname,
        email: req.body.email,
        companyname: req.body.companyname,
        phone: req.body.phone,
        security: req.body.security,
        password: req.body.password,
        clients: []
    });
    res.redirect('/enter')
});

//  העלאת זימון של סטודנט למשרה ספציפית 
app.post('/interview', async (req, res) => {
    db.collection('interviews').insertOne({
        jobname: req.body.jobname,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        date: req.body.date,
        hour: req.body.hour,
        phone: req.body.phone,
        detail: req.body.detail,

    });
    res.redirect('/indexhr')
});




//הרשמה של סטודנט לאתר
app.post('/student', async (req, res) => {
    db.collection('students').insertOne({
        firstname: req.body.firstname,
        secondname: req.body.secondname,//json.toString(req.body.birthdate),
        email: req.body.email,
        id_number: req.body.id_number,
        phone: req.body.phone,
        security: req.body.security,
        password: req.body.password,

    })
    res.redirect('/enter')
});



//העלאה של משרה חדשה לאתר והוספה למערך משרות לפי אותו המגייס
app.post('/job-detail', async (req, res) => {
    const job = {
        title: req.body.title,
        detail: req.body.detail,//json.toString(req.body.birthdate),
        requirements: req.body.requirements,
        location: req.body.location,
        domain: req.body.domain,
        scope: req.body.scope,
        email: req.body.email,
        job_number: req.body.job_number
    }
    db.collection('jobs').insertOne({
        title: req.body.title,
        detail: req.body.detail,
        requirements: req.body.requirements,
        location: req.body.location,
        domain: req.body.domain,
        scope: req.body.scope,
        email: req.body.email,
        job_number: req.body.job_number

    })
    db.collection('hrs').findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                db.collection('hrs').updateOne({ email: user.email }, {
                    $push: {
                        myjobs: job
                    }
                })
            }
        })
    db.collection('students').findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                db.collection('students').updateOne({ email: user.email }, {
                    $push: {
                        favjobs: job
                    }
                })
            }
        })
    res.redirect(req.get('referer'));
});




//העלאת הודעה לבסיס נתונים מסוכן למגייס
app.post('/agenttoHR', async (req, res) => {
    db.collection('agents_to_hrs').insertOne({
        mail: req.body.mail,
        mailhr: req.body.mailhr,
        name: req.body.name,
        job_name: req.body.job_name,
        filename: Binary(req.body.filename),
        detail: req.body.detail,
    })
    res.redirect('/index_agent')
});

//העלאת הודעה לבסיס נתונים מסוכן לסטודנט
app.post('/agenttostudent', async (req, res) => {
    db.collection('agent_to_student').insertOne({
        mail: req.body.mail,
        mailstudent: req.body.mailstudent,
        name: req.body.name,
        job: req.body.job,
    })
    res.redirect('/index_agent')
});


//העלאת הודעה לבסיס נתונים מסטודנט לסוכן
app.post('/studentcontact', async (req, res) => {
    db.collection('students_to_agents').insertOne({
        email: req.body.email,
        name: req.body.name,
        subject: req.body.subject,
        content: req.body.content,
    })
    res.redirect('/index')
});

//העלאת הודעה לבסיס נתונים ממגייס לסוכן
app.post('/hrcontact', async (req, res) => {
    db.collection('hrs_to_agents').insertOne({
        email: req.body.email,
        name: req.body.name,
        subject: req.body.subject,
        content: req.body.content,
    })
    res.redirect('/indexhr')
});


//התחברות של סטודנטת מגייס וסוכן לאתר לפי הפרמטרים שנמצאו בבסיס נתונים
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body)
    try {
        db.collection('students').findOne({ email: email })
            .then((user) => {
                if (user) {
                    if (user.password == req.body.password) {
                        console.log('in index')
                        session = req.session
                        session.userid = email
                        res.redirect('/index')
                        res.end()
                    } else {
                        console.log("login failed")
                        res.send("login failed")

                    }
                }
                else {
                    db.collection('hrs').findOne({ email: email })
                        .then((user) => {
                            if (user) {
                                if (user.password == req.body.password) {
                                    console.log('in hr');
                                    session = req.session
                                    session.userid = email
                                    res.redirect(`/indexhr`);
                                    res.end()
                                } else {
                                    console.log("login failed")
                                    res.send("login failed")

                                }
                            }
                            else {
                                db.collection('agents').findOne({ email: email })
                                    .then((user) => {
                                        if (user) {
                                            if (user.password == req.body.password) {
                                                console.log('in agent');
                                                session = req.session
                                                session.userid = email
                                                res.redirect('/index_agent');
                                                res.end()
                                            } else {
                                                console.log("login failed")
                                                res.send("login failed")

                                            }
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

//התנתקות מהאתר
app.post('/logout', (req, res) => {
    console.log("logout")
    req.session.destroy();
    session = req.session
    res.redirect('/enter')



})

//שחזור סיסמה לאתר
app.post('/porggot', async (req, res) => {
    const email = req.body.email;
    const security = req.body.security;
    try {
        db.collection('students').findOne({ email: email })
            .then((user) => {
                if (user) {
                    db.collection('students').findOne({ security: security })
                    if (user.security == security) {
                        db.collection('students').updateOne({ email: email }, {
                            $set: {
                                password: req.body.password
                            }
                        })
                        res.redirect('/enter')
                    }
                    else {
                        console.log("change password failed")
                        res.send("Your security question is wrong!")

                    }
                }
                else {
                    db.collection('hrs').findOne({ email: email })
                        .then((user) => {
                            if (user) {
                                db.collection('hrs').findOne({ security: security })
                                if (user.security == security) {
                                    db.collection('hrs').updateOne({ email: email }, {
                                        $set: {
                                            password: req.body.password
                                        }
                                    })
                                    res.redirect('/enter')
                                }
                                else {
                                    console.log("change password failed")
                                    res.send("Your security question is wrong!")

                                }
                            }
                            else {
                                db.collection('agents').findOne({ email: email })
                                    .then((user) => {
                                        if (user) {
                                            db.collection('agents').findOne({ security: security })
                                            if (user.security == security) {
                                                db.collection('agents').updateOne({ email: email }, {
                                                    $set: {
                                                        password: req.body.password
                                                    }
                                                })
                                                res.redirect('/enter')
                                            }
                                            else {
                                                console.log("change password failed")
                                                res.send("Your security question is wrong!")

                                            }
                                        }
                                    })
                            }


                        })

                }

            })


    }
    catch {
        console.log("failed");
        res.send("change failed");
    }

});

//עדכון פרטים של סטודנט לפי מייל וטלפון
app.post('/changestudentprofile', async (req, res) => {
    const email = req.body.email;
    try {
        db.collection('students').findOne({ email: email })
            .then((user) => {
                if (user) {
                    if (Object.keys(req.body.new_email).length === 0) {
                        db.collection('students').updateOne({ email: email }, {
                            $set: {
                                phone: req.body.phone

                            }
                        })
                    }
                    else if (Object.keys(req.body.phone).length === 0) {
                        db.collection('students').updateOne({ email: email }, {
                            $set: {
                                email: req.body.new_email

                            }
                        })
                    }
                    else if (Object.keys(req.body.phone).length === 0 && Object.keys(req.body.new_email).length === 0) {
                        res.redirect('/index')
                    }
                    res.redirect('/index')
                }

            })

    }
    catch {
        console.log("failed");
        res.send("change failed");
    }

});

//עדכון משרה של מגייס ספציפי לפי מספר משרה
app.post('/update_job', async (req, res) => {
    const email = session.userid;
    try {
        db.collection('hrs').updateOne({ email: email }, { $pull: { "myjobs": { job_number: req.body.job_number } } })
        const job = {
            job_number: req.body.job_number,
            title: req.body.title,
            detail: req.body.detail,
            requirements: req.body.requirements,
            location: req.body.location,
            domain: req.body.domain,
            scope: req.body.scope,
            email: req.body.email,
        }
        db.collection('hrs').findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    db.collection('hrs').updateOne({ email: user.email }, {
                        $push: {
                            myjobs: job
                        }
                    })
                }
            })
        db.collection('jobs').updateOne({ job_number: req.body.job_number }, {
            $set: {
                title: req.body.title
            }
        })
        db.collection('jobs').updateOne({  job_number: req.body.job_number}, {
            $set: {
                detail: req.body.detail
            }
        })
        db.collection('jobs').updateOne({  job_number: req.body.job_number }, {
            $set: {
                requirements: req.body.requirements
            }
        })
        db.collection('jobs').updateOne({  job_number: req.body.job_number}, {
            $set: {
                location: req.body.location
            }
        })
        db.collection('jobs').updateOne({  job_number: req.body.job_number }, {
            $set: {
                domain: req.body.domain
            }
        })
        db.collection('jobs').updateOne({ job_number: req.body.job_number }, {
            $set: {
                scope: req.body.scope
            }
        })
        res.redirect(req.get('referer'));
    }
    catch {
        console.log("failed");
        res.send("change failed");
    }
})

//מחיק התראה של סטודנטים מדף התראות לפי שם ההתראה
app.post('/notifications_student/:name', (req, res) => {
    const email = session.userid
    db.collection('students').findOne({ email: email })
        .then((user) => {
            if (user) {
                db.collection('interviews').deleteOne({ name: req.params.name })

            }
            res.redirect(req.get('referer'));
        })
})

//מחיקת התראה של מגייסים מדף התראות לפי שם ההתראה
app.post('/notifications_HR/:id', (req, res) => {
    const email = session.userid
    db.collection('hrs').findOne({ email: email })
        .then((user) => {
            if (user) {
                db.collection('agents_to_hrs').deleteOne({ name: req.params.id })

            }
            res.redirect(req.get('referer'));
        })
})

//מחיקת התראה של סוכנים מדף התראות לפי שם ההתראה
app.post('/notifications_agent/:id', (req, res) => {
    const email = session.userid
    db.collection('agents').findOne({ email: email })
        .then((user) => {
            if (user) {
                db.collection('students_to_agents').deleteOne({ name: req.params.id })
                db.collection('hrs_to_agents').deleteOne({ name: req.params.id })

            }
            res.redirect(req.get('referer'));
        })


})

//מחיקה של משרה מועדפת מדף מועדפים לפי שם המשרה
app.post('/favorite/:id', (req, res) => {
    const email = session.userid
    Student.findOne({ email: email })
        .then(result => {
            if (result) {
                db.collection('students').updateOne({ email: email }, { $pull: { "favjobs": { title: req.params.id } } })
            }
            res.redirect(req.get('referer'));
        })

})

//מחיקה של משרה לפי שם המגייס ולפי השם משרה אותה העלאה לאתר 
app.post('/indexhr/:id', async (req, res) => {
    const email = session.userid
    const StudentRef = db.collection('students');
    hr.findOne({ email: email })
        .then(result => {
            if (result) {
                db.collection("jobs").deleteOne({ title: req.params.id })
                db.collection('hrs').updateOne({ email: email }, { $pull: { "myjobs": { title: req.params.id } } })
                StudentRef.find().toArray((err, arr) => {
                    arr.forEach(stud => {
                        db.collection('students').updateOne({ email: stud.email }, {
                            $pull: { favjobs: { title: req.params.id } }
                        })
                    })
                })
            }
            res.redirect(req.get('referer'));
        })

});


//הוספה של משרה לדף מועדפים על ידי לחיצה על כפתור לב 
app.post('/index/:id1/:id2/:id3/:id4/:id5/:id6/:id7', async (req, res) => {
    const email = session.userid
    Student.findOne({ email: email })
        .then(result => {
            if (result) {
                const favoritejob = { title: req.params.id1, location: req.params.id2, scope: req.params.id3, requirements: req.params.id4, domain: req.params.id5, detail: req.params.id6, email: req.params.id7 }
                db.collection('students').updateOne({ email: result.email }, { $push: { favjobs: favoritejob } })
            }
            res.redirect(req.get('referer'));
        })

});

app.post('/domainSearch', async (req, res) => {
    const email = session.userid;
    console.log('im in domain')
    db.collection('students').updateOne({ email: email }, {
        $set: {
            search: "1"
        }

    })
    res.redirect(req.get('referer'))

})

app.post('/citySearch', async (req, res) => {
    const email = session.userid;
    db.collection('students').updateOne({ email: email }, {
        $set: {
            search: "2"
        }
    })
    res.redirect(req.get('referer'))
})


app.post('/selectionSearch', async (req, res) => {
    const email = session.userid;
    db.collection('students').updateOne({ email: email }, {
        $set: {
            search: "3"
        }
    })
    res.redirect(req.get('referer'))
})

//הוספת פרטים אישיים של הסטודנט והעלאת קורות חיים לבסיס נתונים
app.post('/upload', upload.single('file'), (req, res) => {
    const email = req.body.email;
    const city = req.body.city;
    const Job_selection = req.body.Job_selection;
    const domain = req.body.domain;

    try {
        db.collection('students').findOne({ email: email })
            .then((user) => {
                if (user) {

                    db.collection('students').updateOne({ email: email }, {
                        $set: {
                            Job_selection: Job_selection
                        }
                    })
                    db.collection('students').updateOne({ email: email }, {
                        $set: {
                            city: city
                        }
                    })
                    db.collection('students').updateOne({ email: email }, {
                        $set: {
                            domain: domain
                        }
                    })




                    res.redirect('/index')
                }

            })

    }

    catch {
        console.log("failed");
        res.send("change failed");
        res.redirect('/404')
    }

});

//מחיקה של המועמדים פוטנציאלים מדף ההתראות על ידי זיהוי של תעודת זהות ושם המשרה
app.post('/notifications_delete/:title/:id', (req, res) => {
    const email = session.userid
    hr.findOne({ email: email })
        .then(result => {
            if (result) {
                db.collection('hrs').updateOne({ email: email }, { $pull: { "clients": { jobstitle: req.params.title, studentid: req.params.id } } })
            }
            res.redirect(req.get('referer'));
        })

});

// מחיקה של התראה של סוכן ממגייס לפי שם המשרה
app.post('/notificationshr_delete/:title', (req, res) => {
    db.collection('agents_to_hrs').deleteOne({ job_name: req.params.title })
    res.redirect(req.get('referer'));
});

app.post('/index_post/:id/:jobtitle/:email', (req, res) => {
    const email = session.userid
    Student.findOne({ email: email })
        .then(result => {
            if (result) {
                hr.findOne({ email: req.params.email })
                    .then(result => {
                        if (result) {
                            console.log(req.params.id)
                            result.myjobs.forEach(job => {
                                if (job.title === req.params.jobtitle) {
                                    console.log(result.email)
                                    db.collection('hrs').updateOne({ email: result.email }, {
                                        $push: {
                                            clients: { studentid: req.params.id += '.pdf', jobstitle: req.params.jobtitle }
                                        }

                                    })
                                }
                            })
                        }
                    })
            }
            res.redirect(req.get('referer'));
        })


});




app.post('/CV', (req, res) => {
    res.redirect(req.get('referer'));
})

app.post('/interview_student', (req, res) => {
    res.render('interview')
})


const server = app.listen(3000,function () {
    console.log("listening to port 3000")
});
module.exports = server;