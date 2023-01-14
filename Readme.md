# Students_IL

This file will describe how to install the necessary libraries to run the site.

## Installation

Install the libraries with NPM:

```bush
$ npm install
```

## Data-Base
To connect to the database, you need the following code:

```java script
const dbURI = "mongodb+srv://StudentsIL:StudentsIL1234@students.ocwlk3a.mongodb.net/users?retryWrites=true&w=majority"
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err));
var db = mongoose.connection

```

## Run website

Run the application with the following command:

```java script
$ node app
```
Then to open the website on your computer write:

```java script
https:// localhost:3000
```
