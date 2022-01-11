const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const keys = require("../../config/keys");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const nodemailer = require("nodemailer");
const cors = require('cors');

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateResetInput = require("../../validation/reset");
const validateForgotInput = require("../../validation/forgot");

// Load User model
const User = require("../../models/User");
const Forgot = require("../../models/Forgot");
const Verification = require("../../models/Verifications");

const auth = require("../../middleware/check-auth");
const Token = require("../../models/Tokens");
const CORS_URL = require("../../config/keys").CORS_URL;

// CORS
const corsOptions = {
    origin: CORS_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", cors(corsOptions), (req, res) => {
    // Form validation

    const {errors, isValid} = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    let email = req.body.email;

    randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    function randomString(length, chars) {
        let randString = '';
        for (let i = length; i > 0; --i) randString += chars[Math.floor(Math.random() * chars.length)];
        let codec = randString;
        let randString2 = '';
        for (let i = length; i > 0; --i) randString2 += chars[Math.floor(Math.random() * chars.length)];
        let codec2 = randString2;
        let randId = codec + codec2 + new Date().getTime();

        const verificationReq = new Verification({
            key: randId,
            email: email
        });

        User.findOne({email: {$eq: req.body.email}}).then(user => {
            if (user) {
                return res.status(400).json({email: "Email already exists"});
            } else {
                const newUser = new User({
                    name: req.body.name,
                    tel: req.body.tel,
                    role: 3,
                    email: req.body.email,
                    password: req.body.password,
                    verification: 0
                });

                // register email function
                async function registerEmail() {
                    let transporter = nodemailer.createTransport({
                        host: keys.MAIL_HOST,
                        port: keys.MAIL_PORT,
                        secure: keys.MAIL_SECURE,
                        requireTLS: keys.MAIL_TLS,
                        auth: {
                            user: keys.MAIL_ACC,
                            pass: keys.MAIL_PW
                        }
                    });

                    let mailOptions = {
                        from: keys.MAIL_ACC,
                        to: email,
                        subject: 'Email verification - Coduza mernBase',
                        html:
                            '<div style="' +
                            'background-color: #f3f4fa;' +
                            'width: 95%;' +
                            'display: flex;' +
                            'justify-content: center;' +
                            'align-items: center;' +
                            'text-align: center;' +
                            'flex-direction: column;' +
                            'padding: 100px 30px 50px 30px;' +
                            'border-radius: 10px;' +
                            '">' +
                            '<div style="width: 100%; min-height: 400px;">' +
                            '<img src="https://ipfs.io/ipfs/QmRdRKtXDUJsb1qw9HxHBrvzu7s3QCB8KWqAnv9ULhS6m5" style="width: 200px" alt="Votechno Logo">' +
                            '<div>' +
                            '<h2>Hello there,</h2>' +
                            '<p>' +
                            'Just click below to verify that you are a part of <b>Coduza mernBase</b>' +
                            '</p>' +
                            '<br>' +
                            '<a ' +
                            'style="' +
                            'background-color: #007FFF; ' +
                            'border-radius: 10px; ' +
                            'width: 150px; ' +
                            'height: 48px; ' +
                            'color: #fff;' +
                            'cursor: pointer;' +
                            'padding: 10px 30px;' +
                            'text-decoration: none;' +
                            '" ' +
                            'href="' + keys.PW_URL + 'verify-email/' + randId + '"' +
                            '>' +
                            '' + '<b>Verify</b>' + '' +
                            '</a>' +
                            '<br>' +
                            '<br>' +
                            '<br>' +
                            '<p style="color: rgba(0,0,0,0.8); font-size: 11px;">in case of the verification button does not work, Please manually copy and paste <br>the following link into your web browser</p>' +
                            '<p style="color: rgba(0,0,0,0.8); font-size: 11px;">' + keys.PW_URL + 'verify-email/' + randId + '</p>' +
                            '<br>' +
                            '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">If you did not register with this email on <a href="https://votechno.lk">votechno.lk</a>, You can safely ignore this email. <br>Only a person with access to your email can create an account on behalf of this email.</p>' +
                            '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' Coduza mernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
                            '</div>' +
                            '</div>' +
                            '</div>'
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error.message);
                        }
                        console.log('success');
                    });
                }

                // register email function

                // Hash password before saving in database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user2 => {
                                res.json(user2);

                                verificationReq
                                    .save()
                                    .then(verification => {

                                        registerEmail().then(res33 => {
                                            console.log("all success registration")
                                        }).catch(err33 => {
                                            return res
                                                .status(404)
                                                .json({errorsendingemail: "Error while sending email"});
                                        })

                                    }).catch(err34 => {
                                    return res
                                        .status(404)
                                        .json({errorsendingemail: "Error while generating verification key"});
                                })

                            })
                            .catch(err2 => console.log(err2));
                    });
                });
            }
        });
    }
});

// accept verification
router.get("/accept-verification", cors(corsOptions), (req, res) => {

    let key = req.query.id;

    Verification.findOne({key: {$eq: key}}).then(async user => {
        if (!user) {
            console.log("Invalid verification link");
            return res.status(400).json({email: "Invalid verification link"});
        } else {

            await User.findOne({email: {$eq: user.email}, status: 1}).then(async user65 => {

                let email = user65.email;
                console.log(email);

                // register email function
                async function registerEmail() {
                    let transporter = nodemailer.createTransport({
                        host: keys.MAIL_HOST,
                        port: keys.MAIL_PORT,
                        secure: keys.MAIL_SECURE,
                        requireTLS: keys.MAIL_TLS,
                        auth: {
                            user: keys.MAIL_ACC,
                            pass: keys.MAIL_PW
                        }
                    });

                    let mailOptions = {
                        from: keys.MAIL_ACC,
                        to: email,
                        subject: 'Account verified successfully - Coduza mernBase',
                        html:
                            '<div style="' +
                            'background-color: #f3f4fa;' +
                            'width: 95%;' +
                            'display: flex;' +
                            'justify-content: center;' +
                            'align-items: center;' +
                            'text-align: center;' +
                            'flex-direction: column;' +
                            'padding: 100px 30px 50px 30px;' +
                            'border-radius: 10px;' +
                            '">' +
                            '<div style="width: 100%; min-height: 400px;">' +
                            '<img src="https://ipfs.io/ipfs/QmRdRKtXDUJsb1qw9HxHBrvzu7s3QCB8KWqAnv9ULhS6m5" style="width: 200px" alt="Votechno Logo">' +
                            '<div>' +
                            '<h2>Hello, ' + escape(user65.name) + '</h2>' +
                            '<h1>' +
                            'Welcome to the <b>Coduza mernBase</b>' +
                            '</h1>' +
                            '<h3>Your account has been verified successfully</h3>' +
                            '<br>' +
                            '<a ' +
                            'style="' +
                            'background-color: #007FFF; ' +
                            'border-radius: 10px; ' +
                            'width: 150px; ' +
                            'height: 48px; ' +
                            'color: #fff;' +
                            'cursor: pointer;' +
                            'padding: 10px 30px;' +
                            'text-decoration: none;' +
                            '" ' +
                            'href="' + keys.PW_URL + 'login"' +
                            //'data-saferedirecturl="https://www.google.com/url?q=' + keys.PW_URL + 'forgot-change-password?id=' + randId + '"' +
                            '>' +
                            '' + '<b>Next step</b>' + '' +
                            '</a>' +
                            '<br>' +
                            '<br>' +
                            '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">This email was generated because your registration at <a href="https://votechno.lk">votechno.lk</a> has been successful.</p>' +
                            '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' Coduza mernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
                            '</div>' +
                            '</div>' +
                            '</div>'
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error.message);
                        }
                        console.log('success');
                    });
                }

                await User.updateOne({email: {$eq: email}}, {verification: 1}).then(verification => {
                    Verification.deleteMany({email: {$eq: email}}).then(async res33 => {


                        await registerEmail().then(res33 => {
                            console.log("all success verification")
                            return res
                                .status(200)
                                .json({success: "all success"});
                        }).catch(err33 => {
                            console.log(err33);
                            return res
                                .status(404)
                                .json({errorsendingemail: "Error while sending email"});
                        })

                    }).catch(err33 => {
                        console.log("Error 2");
                        return res
                            .status(404)
                            .json({errorsendingemail: "Error"});
                    })
                }).catch(err34 => {
                    console.log("Error 3");
                    return res
                        .status(404)
                        .json({errorsendingemail: "Error"});
                })

            }).catch(err65 => {
                console.log("Error 4");
                return res
                    .status(404)
                    .json({errorsendingemail: "Error"});
            })

        }
    });
});

// @desc Login user and return JWT token
// @access Public
router.post("/login", cors(corsOptions), (req, res) => {
    // Form validation

    const {errors, isValid} = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({email: {$eq: email}, status: 1}).then(user => {
        // Check if user exists
        if (!user) {
            return res.status(404).json({emailnotfound: "Email not found"});
        }

        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    tel: user.tel,
                    email: user.email,
                    role: user.role
                };

                // Sign token
                const token = jwt.sign(
                    payload,
                    keys.secretOrKey, {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {

                        const tokenLog = new Token({
                            user: user.id,
                            token: token,
                            status: 1,
                            date: new Date()
                        });

                        tokenLog.save().then(data88 => {
                            res.json({
                                success: true,
                                token: token
                            });
                        }).catch(err88 => console.log(err88));

                    }
                );

            } else {
                return res
                    .status(400)
                    .json({passwordincorrect: "Password incorrect"});
            }
        });
    });
});

router.post('/forgot', cors(corsOptions), (req, res) => {
    const {errors, isValid} = validateForgotInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    let email = req.body.email;

    randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    function randomString(length, chars) {
        let randString = '';
        for (let i = length; i > 0; --i) randString += chars[Math.floor(Math.random() * chars.length)];
        let codec = randString;

        let randString2 = '';
        for (let i = length; i > 0; --i) randString2 += chars[Math.floor(Math.random() * chars.length)];
        let codec2 = randString2;

        let randId = codec + codec2 + new Date().getTime();

        const forgotReq = new Forgot({
            id: randId,
            email: email
        });

        // Find user by email
        User.findOne({email: {$eq: email}, status: 1}).then(user => {
            // Check if user exists
            if (!user) {
                return res.status(404).json({emailnotfound: "Email not found"});
            } else {
                Forgot.findOne({email: {$eq: email}}).then(forgotReqData => {

                    // async..await is not allowed in global scope, must use a wrapper
                    async function forgotEmail() {
                        let transporter = nodemailer.createTransport({
                            host: keys.MAIL_HOST,
                            port: keys.MAIL_PORT,
                            secure: keys.MAIL_SECURE,
                            requireTLS: keys.MAIL_TLS,
                            auth: {
                                user: keys.MAIL_ACC,
                                pass: keys.MAIL_PW
                            }
                        });

                        let mailOptions = {
                            from: keys.MAIL_ACC,
                            to: email,
                            subject: 'Password recovery link - Coduza mernBase',
                            html:
                                '<div style="' +
                                'background-color: #f3f4fa;' +
                                'width: 95%;' +
                                'display: flex;' +
                                'justify-content: center;' +
                                'align-items: center;' +
                                'text-align: center;' +
                                'flex-direction: column;' +
                                'padding: 90px 30px 50px 30px;' +
                                'border-radius: 10px;' +
                                '">' +
                                '<div style="width: 100%; min-height: 400px;">' +
                                '<img src="https://ipfs.io/ipfs/QmRdRKtXDUJsb1qw9HxHBrvzu7s3QCB8KWqAnv9ULhS6m5" style="width: 200px" alt="Votechno Logo">' +
                                '<div>' +
                                '<h2>Hello, ' + escape(user.name) + '</h2>' +
                                '<p>' +
                                'A request has been received to change the <br>password for your Votechno account.' +
                                '</p>' +
                                '<br>' +
                                '<a ' +
                                'style="' +
                                'background-color: #007FFF; ' +
                                'border-radius: 10px; ' +
                                'width: 150px; ' +
                                'height: 48px; ' +
                                'color: #fff;' +
                                'cursor: pointer;' +
                                'padding: 10px 30px;' +
                                'text-decoration: none;' +
                                '"' +
                                'href="' + keys.PW_URL + 'forgot-change-password?id=' + randId + '"' +
                                //'data-saferedirecturl="https://www.google.com/url?q=' + keys.PW_URL + 'forgot-change-password?id=' + randId + '"' +
                                '>' +
                                '' + '<b>Reset Password</b>' + '' +
                                '</a>' +
                                '<br>' +
                                '<br>' +
                                '<br>' +
                                '<p style="color: rgba(0,0,0,0.8); font-size: 11px;">in case of the reset button does not work, Please manually copy and paste <br>the following link into your web browser</p>' +
                                '<p style="color: rgba(0,0,0,0.8); font-size: 11px;">' + keys.PW_URL + 'forgot-change-password?id=' + randId + '</p>' +
                                '<br>' +
                                '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">If you did not request a password reset, you can safely ignore this email. <br>Only a person with access to your email can reset your account password.</p>' +
                                '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' Coduza mernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
                                '</div>' +
                                '</div>' +
                                '</div>'
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error.message);
                            }
                            console.log('success');
                        });
                    }


                    // Check if forgot request exist
                    if (!forgotReqData) {


                        forgotReq
                            .save()
                            .then(user => {

                                res.json(user);


                                forgotEmail().then(r => {
                                    return res
                                        .status(200)
                                        .json({requestSent: "Password recovery link sent, Please check your email"});
                                }).catch(err => {
                                    return res
                                        .status(404)
                                        .json({errorsendingemail: "Error while sending email"});
                                })


                            })
                            .catch(err => console.log(err));


                    } else {


                        Forgot.updateOne({email: {$eq: email}}, {id: randId, date: new Date()}).then(updateReq => {
                            forgotEmail().then(r => {
                                return res
                                    .status(200)
                                    .json({requestSent: "Password recovery link sent, Please check your email"});
                            }).catch(err => {
                                return res
                                    .status(404)
                                    .json({errorsendingemail: "Error while sending email"});
                            })
                        }).catch(err => console.log(err));
                    }
                })
            }
        })
    }
})

router.get('/forgot-change-password', cors(corsOptions), (req, res) => {
    let id = req.query.id;

    // Find user by email
    Forgot.findOne({id: {$eq: id}}).then(request => {
        // Check if user exists
        if (!request) {
            return res.status(200).json({msg: 1});
        } else {
            let curTime = new Date();

            let reqDate = request.date,
                expDate = new Date(reqDate);
            expDate.setMinutes(reqDate.getMinutes() + 160);

            if (curTime >= reqDate && curTime <= expDate) {
                let email = request.email;
                User.findOne({email: {$eq: email}, status: 1}).then(user => {
                    // Check if user exists
                    if (!user) {
                        return res.status(200).json({msg: 2});
                    } else {
                        return res.status(200).json({msg: 200});
                    }
                })
            } else {
                return res.status(200).json({msg: 1});
            }
        }
    })
})

router.post('/reset-password', cors(corsOptions), (req, res) => {

    const {errors, isValid} = validateResetInput(req.body);
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    let id = req.body.tokenId;
    let password = req.body.password;
    let password2 = req.body.password2;

    // Find user by email
    Forgot.findOne({id: {$eq: id}}).then(request => {
        // Check if user exists
        if (!request) {
            // invalid token
            console.log("Invalid token");
            return res
                .status(400)
                .json({invalidtoken: "Invalid Request"});
        } else {
            let email = request.email;
            let curTime = new Date();
            let reqDate = request.date,
                expDate = new Date(reqDate);
            expDate.setMinutes(reqDate.getMinutes() + 160);

            if (curTime >= reqDate && curTime <= expDate) {

                console.log("Cur: " + curTime + ", Req: " + reqDate + ", Exp: " + expDate)

                User.findOne({email: {$eq: email}, status: 1}).then(user => {
                    if (!user) {
                        // no user exist
                        console.log("No user exist");
                        return res
                            .status(400)
                            .json({accountDelete: "Your account has been deleted."});
                    } else {
                        let email = user.email;
                        let role = user.role;
                        if (role === 1) {
                            console.log("Admin password cannot be recovered");
                            return res
                                .status(400)
                                .json({AdminPassword: "Admin password cannot be recovered due to security reasons."});
                        } else {
                            if (password === password2) {
                                // point
                                // Hash password before saving in database
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(password, salt, (err, hash) => {
                                        if (err) throw err;
                                        password = hash;
                                        User.updateOne({
                                            email: {$eq: email},
                                            status: 1
                                        }, {password: password}).then(updateReq => {
                                            Forgot.deleteOne({email: {$eq: email}}).then(delReq => {
                                                //return res.status(200).json("Password updated");
                                                return res
                                                    .status(200)
                                                    .json({passwordReset: "Password recovery successful"});
                                            }).catch(err => console.log(err));
                                        }).catch(err => console.log(err));
                                    });
                                });

                            } else {
                                // password mismatch
                                console.log("Password mismatch");
                                return res
                                    .status(400)
                                    .json({passwordMissMatch: "Passwords must match"});
                            }
                        }
                    }
                }).catch(err => console.log(err));
            } else {
                // time expired link
                Forgot.deleteOne({email: {$eq: email}}).then(delReq => {
                    console.log("Expired link");
                    return res
                        .status(400)
                        .json({expiredLink: "Your recovery link has been expired"});
                }).catch(err => console.log(err));
            }
        }
    })
})

module.exports = router;