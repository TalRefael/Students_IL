
const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

function checkNull(object1) {
  return (
    object1.new_password !== null &&
    object1.phone_number !== null &&
    object1.email !== null &&
    object1.study_year !== null &&
    object1.grades !== null
  );
}
function checkNullJob(object1) {
  return (
    object1.describe_job !== null &&
    object1.job_type !== null &&
    object1.location !== null
  );
}
const dbURI =
  "mongodb+srv://StudentsIL:StudentsIL1234@students.ocwlk3a.mongodb.net/users?retryWrites=true&w=majority";
let db = mongoose.connection;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("connected to db + listing to port 3000");
  })
  .catch((err) => console.log(err));


//הרשמה סטודנט
describe("POST /student", () => {
  it("Should be status code 302", async () => {
    const newUser = await request(app).post("/student").send({
      firstname: 'ofek',
      secondname: 'biton',
      email: 'ofekbiton120200@gmail.com',
      phone: '0549254191',
      security: 'billie',
      password: '123456789Tpen',
    });
    expect(newUser.statusCode).toBe(302);
  });
});

//הרשמה מגייס
describe("POST /hr", () => {
  it("Should be status code 302", async () => {
    const newUser = await request(app).post("/hr").send({
      firstname: 'gal',
      secondname: 'yossef',
      email: 'galyossef15@gmail.com',
      companyname: 'castro',
      phone: '0544676374',
      security: 'ilanit',
      password: '123',

    });
    expect(newUser.statusCode).toBe(302);
  });
});

// התחברות סטודנט
describe("POST /login", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/login").send({
        email: "talrefaelov12@gmail.com",
        password: "Tal1234",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});

// התחברות מגייס
describe("POST /login", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/login").send({
        email: "ofekbiton120200@gmail.com",
        password: "Ofek1234",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});

// התחברות סוכן
describe("POST /login", () => {
  describe("when passed a username and password", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).post("/login").send({
        email: "Shir@gmail.com",
        password: "Shir1234",
      });
      expect(response.statusCode).toBe(302);
    });
  });
});

//התנתקות סוכן
describe("POST /logout", () => {
  it("agent logout - should return status code 302,which means admin logged out successfully and got redirected to the main page which sends the code 302", async () => {
    const user = await request(app).post("/logout")
    expect(user.statusCode).toBe(302);
  });
});


//עדכון פרטי סטודנט
describe("POST /changestudentprofile", () => {
  it("Should be status code 404 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      email: "talrefaelov12@gmail.com",
      phone: "0508555905",
    };
    const updateUser = await request(app)
      .post("/students/studentsUpdate")
      .send(details);
    expect(updateUser.status).toBe(404);
    expect(checkNull(details)).toBe(true);
    expect(checkNull({ new_password: null })).toBe(false);
  });
});



//העלאת משרה חדשה בתור מגייס
describe("POST /job_detail", () => {
  it("Checking side function that checks the value of the details passed,return true if value is good, if passed so the job was succcessfully added to database", async () => {
    const details = await request(app).post("/job_detail").send({
      job_number: "233156",
      title: "פקידה רפואית - מכבי",
      detail: "עבודה עם לוזים רבים ותפקוד תחת לחץ",
      requirements: "ניסיון של שנה לפחות",
      location: "באר שבע",
      domain: "מזכירות",
      scope: "מלאה",
      email: "ofekbiton120200@gmail.com",
    });
    expect(details.status).toBe(404);

  });
});

// בדיקת דף משרות של מגייס
describe("it should respons to userRequests page ", () => {
  test("should return status code of 500, because there is no TOKEN session", (done) => {
    request(app)
      .get("/indexhr")
      .then((response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
  });
});


// דף יצירת קשר עם מועמדים למשרה
describe("it should respons to seeCandidates page ", () => {
  test("should return status code of 302, because there is no TOKEN session", (done) => {
    request(app)
      .get(
        "/interview/talrefaelov1@gmail.com"
      )
      .then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
  });
});

// בקשת עזרה של מגייס מסוכן
describe("POST /hrcontact", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      name: "אסיף פרץ",
      email: "asif13p@gmail.com",
      subject: "עזרה מסוכן",
      content: "אשמח לסוכן על מנת שאוכל למצוא את המועמד המתאים עבורי עבור משרה למהנדס תוכנה"
    };
    const sendRequest = await request(app)
      .post("/hrcontact")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});

// שליחת פנייה מסוכן למגייס
describe("POST /agenttoHR", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      mail: "asif13p@gmail.com",
      mailhr: "ofekbiton120200@gmail.com",
      name: "אסיף פרץ",
      job_name: "מאבטח במשחקי כדורגל",
      detail: "אני בטוח שאסיף הוא המועמד הטוב עבורך!"
    };
    const sendRequest = await request(app)
      .post("/agenttoHR")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});

// שליחת פנייה מסוכן לסטודנט
describe("POST /agenttostudent", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      mail: "ofekbiton120200@gmail.com",
      mailstudent: "galyossef15@gmail.com",
      name: "פקידת קבלה",
      job: "המשרה הזאת מתאימה עבורך!"
    };
    const sendRequest = await request(app)
      .post("/agenttostudent")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});

// בקשת עזרה של סטודנט מסוכן
describe("POST /studentcontact", () => {
  it("it should respond status code 302 because there is no TOKEN session so we get redirected", async () => {
    const details = {
      name: "ליאור רפאלוב",
      email: "lior@gmail.com",
      subject: "עזרה מסוכן",
      content: "אשמח לסוכן כדי שאוכל למצוא את המשרה המתאימה לכישורי"
    };
    const sendRequest = await request(app)
      .post("/studentcontact")
      .send(details);
    expect(sendRequest.status).toBe(302);
  });
});

//שמירת משרה במועדפים סטודנט
describe("POST /favorite/:id", () => {
  it("Should be status code 500 because it should not add to favorite without the session TOKEN recieved from user login", async () => {
    const favor = await request(app).post(
      "/favorite/talrefaelov1@gmail.com"
    );
    expect(favor.status).toBe(500);
  });
});

//הגשת מועמדות למשרה - סטודנט
describe("POST /index_post/:id/:jobtitle/:email", () => {
  it("Should be status code 500 because it should not add to send without the session TOKEN recieved from user login", () => {
    const apply = request(app).post(
      "/index_post/galyossef15@gmail.com/פקידה רפואית - מכבי/ofekbiton120200@gmail.com"
    );
    expect(apply.status).toBe(undefined);
  });
});

//מגייס - דף של כל ההתראות
describe("it should respons to userRequests page ", () => {
  test("should return status code of 500, because there is no TOKEN session", (done) => {
    request(app)
      .get("/notifications_HR")
      .then((response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
  });
});

//סוכן - דף של כל ההתראות
describe("it should respons to userRequests page ", () => {
  test("should return status code of 200, because there is no TOKEN session", (done) => {
    request(app)
      .get("/notifications_agent")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

//סטודנט - דף של כל ההתראות
describe("it should respons to userRequests page ", () => {
  test("should return status code of 500, because there is no TOKEN session", (done) => {
    request(app)
      .get("/notifications_student")
      .then((response) => {
        expect(response.statusCode).toBe(500);
        done();
      });
  });
});

//מגייס - מחיקת משרה
describe("POST /indexhr/:id", () => {
  it("Should be status code 500 because it should not delete without the session TOKEN recieved from user login", () => {
    const apply = request(app).post(
      "/indehr/פקידה רפואית - מכבי"
    );
    expect(apply.status).toBe(undefined);
  });
});

// סטודנט - שינוי סוג משרה
describe("POST /upload", () => {
  it("Should be status code 302 because it should not updated without the session TOKEN recieved from user login, and checking side function that checks the value of the details passed,return true if value is good", async () => {
    const details = {
      Job_selection: "משמרות",
      city: "באר שבע",
      domain: "הנדסה"
    };
    const updateUser = await request(app)
      .post("/upload")
      .send(details);
    expect(updateUser.status).toBe(302);
  });
});

//סוכן-מחיקת פנייה מסטודנט אל סוכן
describe("POST /notifications_agent/:id", () => {
  it("Should be status code 500 because it should not delete without the session TOKEN recieved from user login", () => {
    const apply = request(app).post(
      "//notifications_agent/גל יוסף"
    );
    expect(apply.status).toBe(undefined);
  });
});
