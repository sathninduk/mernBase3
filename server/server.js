const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require('cors');

const users = require("./routes/api/users");
const admin = require("./routes/api/admin");
const u = require("./routes/api/u")
const instructor = require("./routes/api/instructor")
const path = require("path");

// set up rate limiter: maximum of five requests per minute
const RateLimit = require('express-rate-limit');
const limiter = new RateLimit({
    windowMs: 5*60*1000, // 5 minutes
    max: 100,
    message:
        "Rate limit exceeded"
});

// middleware
const auth = require('./middleware/check-auth');

const app = express();

const helmet = require('helmet')
app.use(helmet())
//app.disable('x-powered-by');

// Bodyparser middleware
app.use(
    limiter,
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;
//const db = "mongodb+srv://coduza:xsi0xKjtMEs3O19Q@cluster0.bujlo.mongodb.net/votechno?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose
    .connect(
        db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

app.use(cors());
app.use('/public', express.static(__dirname + '/public'));
//app.use('/public', express.static('/public'));

// Passport config
require("./config/passport")(passport);


// Routes
app.use("/api/users", users);
app.use("/api/admin", admin);
app.use("/api/u", u);
app.use("/api/instructor", instructor);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));