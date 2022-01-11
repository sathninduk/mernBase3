const express = require("express");
const router = express.Router();
const sanitizer = require('sanitizer');

// Load User model
const User = require("../../models/User");
const Assign = require("../../models/Assign");

// middleware
const auth = require('../../middleware/check-auth');
const fs = require("fs");
const bcrypt = require("bcryptjs");
const cors = require('cors')

// validation
const validateRegisterInput = require("../../validation/register");
const validateChangePasswordInput = require("../../validation/change-pw");
const validateEditUserInput = require("../../validation/edit-user");

const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const {data} = require("browserslist");

const multer = require('multer')
const {v4: uuidV4} = require('uuid');
const Verification = require("../../models/Verifications");
const nodemailer = require("nodemailer");
const Token = require("../../models/Tokens");

const CORS_URL = keys.CORS_URL;
// CORS
const corsOptions = {
    origin: CORS_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// admin dashboard features
// users
// get user information
router.route('/users').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        User.find({
            role: 3
        }, (error, data) => {
            if (error) {
                return (error)
            } else {
                res.json(data)
            }
        })
    } else {
        res.status(401)
    }
})

// get single user information
router.route('/user').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        let id = req.query.id
        User.findOne({_id: {$eq: id}}).then(data => {
            res.json(data)
        }).catch(error => {
            console.log(error);
            return res
                .status(404)
                .json({internalError: "Unexpected error occurred! Please try again."});
        })
    } else {
        res.status(401)
    }
})

// admin level 2
// get admin level 2 information
router.route('/instructors').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        User.find({
            role: 2
        }, (error, data) => {
            if (error) {
                return (error)
            } else {
                res.json(data)
            }
        })
    } else {
        res.status(401)
    }
})

// get single admin level 2 information
router.route('/instructor').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {

        let id = req.query.id;

        User.find({_id: {$eq: id}, role: 2}).then((data) => {
            res.status(200).json(data);
        }).catch((error) => {
            res.status(404).json({internalError: "Instructor not found"});
        })

    } else {
        res.status(401)
    }
})

// super admins
// get user information
router.route('/super-admins').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        User.find({
            $and: [
                {role: 1},
                {email: {$ne: 'admin@votechno.lk'}},
                {email: {$ne: req.email}}
            ]
        }, (error, data) => {
            if (error) {
                return (error)
            } else {
                res.json(data)
            }
        })
    } else {
        res.status(401)
    }
})

// admin user management
// user - disable
router.route('/users/disable').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        let id = req.body.id;

        User.findOne({_id: {$eq: id}}).then((user) => {
            let email = user.email;

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
                    subject: 'Account disabling notification - MernBase',
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
                        '<img src="https://ipfs.io/ipfs/QmTLgXxswcZM5LrscWJwfKJ4LEwojMHxfymV8qdA6p5wSm" style="width: 200px" alt="MernBase Logo">' +
                        '<div>' +
                        '<h2>Hello, ' + sanitizer.sanitize(user.name) + '</h2>' +
                        '<h1>' +
                        'Your MernBase account has been temporarily disabled' +
                        '</h1>' +
                        '<br>' +
                        '<br>' +
                        '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' MernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
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

            User.updateOne({_id: {$eq: id}}, {status: 0}).then(async data1 => {

                await registerEmail().then(r => {
                    console.log("Full success")
                    res.status(200).json(data1);
                }).catch(err => {
                    return res
                        .status(404)
                        .json({errorsendingemail: "Error while sending email"});
                })

            }).catch(err1 => {
                console.log(err1);
                return res
                    .status(404)
                    .json({internalError: "Unexpected error occurred! Please try again."});
            })

        }).catch((error1) => {
            console.log(error1);
            return res
                .status(404)
                .json({internalError: "Unexpected error occurred! Please try again."});
        })

    }
})

// user - enable
router.route('/users/enable').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        let id = req.body.id;
        User.updateOne({_id: {$eq: id}}, {status: 1}).then(data1 => {


            User.findOne({_id: {$eq: id}}).then(async data2 => {
                let email = data2.email;

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
                        subject: 'Account enabling notification - MernBase',
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
                            '<img src="https://ipfs.io/ipfs/QmTLgXxswcZM5LrscWJwfKJ4LEwojMHxfymV8qdA6p5wSm" style="width: 200px" alt="MernBase Logo">' +
                            '<div>' +
                            '<h2>Hello, ' + sanitizer.sanitize(data2.name) + '</h2>' +
                            '<h1>' +
                            'Your MernBase account has been reactivated' +
                            '</h1>' +
                            '<br>' +
                            '<br>' +
                            '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' MernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
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

                await registerEmail().then(r => {
                    console.log("Full success")
                    res.status(200).json(data1);
                }).catch(err => {
                    return res
                        .status(404)
                        .json({errorsendingemail: "Error while sending email"});
                })

            }).catch(error2 => {
                console.log(error2);
            })

            //res.status(200).json(data1);


        }).catch(err1 => {
            console.log(err1);
            return res
                .status(404)
                .json({internalError: "Unexpected error occurred! Please try again."});
        })
    }
})

// user - delete
router.route('/users/delete').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {
        let id = req.body.id;

        User.findOne({_id: {$eq: id}}).then(data2 => {
            let email = data2.email;
            User.deleteOne({_id: {$eq: id}}).then(async data1 => {
                await Verification.deleteMany({email: {$eq: email}}).then(async data12 => {
                    await Assign.deleteMany({instructor: {$eq: id}}).then(async data7 => {


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
                                subject: 'Account removal notification - MernBase',
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
                                    '<img src="https://ipfs.io/ipfs/QmTLgXxswcZM5LrscWJwfKJ4LEwojMHxfymV8qdA6p5wSm" style="width: 200px" alt="MernBase Logo">' +
                                    '<div>' +
                                    '<h2>Hello, ' + sanitizer.sanitize(data2.name) + '</h2>' +
                                    '<h1>' +
                                    'Your MernBase account has been permanently deleted' +
                                    '</h1>' +
                                    '<br>' +
                                    '<br>' +
                                    '<p style="color: rgba(0,0,0,0.5); font-size: 11px;">©' + new Date().getFullYear() + ' MernBase | Powered by <a href="https://www.coduza.com">CODUZA</a></p>' +
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

                        await registerEmail().then(r => {
                            console.log("Full success")
                            res.status(200).json(data7);
                        }).catch(err => {
                            return res
                                .status(404)
                                .json({errorsendingemail: "Error while sending email"});
                        })


                    }).catch(err7 => {
                        console.log(err7);
                        return res
                            .status(404)
                            .json({internalError: "Unexpected error occurred! Please try again."});
                    })
                }).catch(err12 => {
                    console.log(err12);
                    return res
                        .status(404)
                        .json({internalError: "Unexpected error occurred! Please try again."});
                })
            }).catch(err1 => {
                console.log(err1);
                return res
                    .status(404)
                    .json({internalError: "Unexpected error occurred! Please try again."});
            })

        }).catch(err13 => {
            console.log(err13);
            return res
                .status(404)
                .json({internalError: "Unexpected error occurred! Please try again."});
        })

    }
})

// register super admins and instructors
router.post("/register", cors(corsOptions), auth.isAuthenticated, (req, res) => {
    // Form validation
    if (req.role == 1) {
        const {errors, isValid} = validateRegisterInput(req.body);

        // Check validation
        if (!isValid) {
            console.log(errors);
            return res.status(400).json(errors);
        }

        User.findOne({email: {$eq: req.body.email}}).then(user => {
            if (user) {
                return res.status(400).json({email: "Email already exists"});
            } else {
                const newUser = new User({
                    name: req.body.name,
                    tel: req.body.tel,
                    role: req.body.role_req,
                    email: req.body.email,
                    password: req.body.password,
                    verification: 1
                });

                // Hash password before saving in database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => {
                                console.log(err);
                                return res
                                    .status(404)
                                    .json({internalError: "Unexpected error occurred! Please try again."});
                            });
                    });
                });
            }
        });
    }
});

// user - edit
router.route('/users/edit').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {

        const {errors, isValid} = validateEditUserInput(req.body);

        // Check validation
        if (!isValid) {
            console.log(errors);
            return res.status(400).json(errors);
        }

        let id = req.body.id;
        User.updateOne({_id: {$eq: id}}, {
            name: {$eq: req.body.name},
            tel: {$eq: req.body.tel}
        }).then(async data1 => {
            res.status(200).json(data1);
        }).catch(err1 => {
            console.log(err1);
            return res
                .status(404)
                .json({internalError: "Unexpected error occurred! Please try again."});
        })
    }
})

// admin/settings - change password
router.route('/settings/password').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 1) {

        const {errors, isValid} = validateChangePasswordInput(req.body);

        // Check validation
        if (!isValid) {
            console.log(errors);
            return res.status(400).json(errors);
        }


        let id = req.id;
        let curPassword = req.body.curPassword;
        let password = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        if (password == confirmPassword) {


            // Find user by email
            User.findOne({_id: {$eq: id}, status: 1}).then(user => {
                // Check if user exists
                if (!user) {
                    return res.status(404).json({curPassword: "User not found"});
                }
                // Check password
                bcrypt.compare(curPassword, user.password).then(isMatch => {
                    if (isMatch) {

                        // Hash password before saving in database
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(password, salt, (err, hash) => {
                                if (err) throw err;
                                password = hash;
                                User.updateOne({_id: {$eq: id}}, {
                                    password: {$eq: password}
                                }).then(async data1 => {
                                    res.status(200).json(data1);
                                }).catch(err1 => {
                                    console.log(err1);
                                    return res
                                        .status(404)
                                        .json({internalError: "Unexpected error occurred! Please try again."});
                                })
                            });
                        });

                    } else {
                        return res
                            .status(400)
                            .json({curPassword: "Password incorrect"});
                    }
                });
            });
        } else {
            res.status(400).json({confPassword: "Password mismatch"});
        }
    }
})

// User check point
router.route('/security/check-point').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    let token = req.headers['x-access-token'];
    Token.findOne({user: {$eq: req.id}, token: {$eq: token}, status: 1}).limit(1).then((data4) => {
        if (data4) {
            User.findOne({_id: {$eq: req.id}, email: {$eq: req.email}, status: 1}).limit(1).then((data3) => {
                res.status(200).json(data3)
            }).catch((error3) => {
                return res
                    .status(404)
                    .json({internalError: "Unexpected error occurred! Please try again."});
            })
        } else {
            res.status(200).json({data3: ""});
        }
    }).catch((error4) => {
        return res
            .status(404)
            .json({internalError: "Unexpected error occurred! Please try again."});
    })
})

// User check point
router.route('/verification/check-point').get(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    User.findOne({_id: {$eq: req.id}, email: {$eq: req.email}, status: 1}).limit(1).then((data3) => {
        res.status(200).json(data3)
    }).catch((error3) => {
        return res
            .status(404)
            .json({internalError: "Unexpected error occurred! Please try again."});
    })
})

module.exports = router;