
const request = require("supertest");
const app = require("../app");

describe("Test the root path", () => {
    test("It should response the GET method", done => {
        request(app)
            .get("/")
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});


describe("POST /student", () => {
    it("Should be status code 200", async () => {
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

describe("POST /hr", () => {
    it("Should be status code 200", async () => {
        const newUser = await request(app).post("/student").send({
            firstname: 'gal',
            secondname: 'yossef',//json.toString(req.body.birthdate),
            email: 'galyossef15@gmail.com',
            companyname: 'castro',
            phone: '0544676374',
            security: 'ilanit',
            password: '123',
           
        });
        expect(newUser.statusCode).toBe(302);
    });
});

describe("POST /login", () => {
    it("Should responde 'login ok'", async () => {
        const student = await request(app).post("/login").send({
            email: 'roie@gmail.com',
            password: '1234567a',
        });
        expect(student.statusCode).toBe(200);
    });
});

describe("POST /login", () => {
    it("Should responde 'login ok'", async () => {
        const student = await request(app).post("/login").send({
            email: 'talrefaelov@gmail.com',
            password: '1234554321',
        });
        expect(student.statusCode).toBe(200);
    });
});

describe("POST /login", () => {
    it("Should responde 'login ok'", async () => {
        const student = await request(app).post("/login").send({
            email: 'shoham@gmail.com',
            password: '1',
        });
        expect(student.statusCode).toBe(200);
    });
});




