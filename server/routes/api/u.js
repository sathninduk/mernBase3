const express = require("express");
const router = express.Router();
const fs = require('fs');
const multer = require('multer')
const {v4: uuidV4} = require('uuid');
const cors = require('cors')

// Load User model

// middleware
const auth = require('../../middleware/check-auth');
const {m} = require("caniuse-lite/data/browserVersions");
const validateChangePasswordInput = require("../../validation/change-pw");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const Verification = require("../../models/Verifications");
const nodemailer = require("nodemailer");
const keys = require("../../config/keys");
const Token = require("../../models/Tokens");

const CORS_URL = require("../../config/keys").CORS_URL;
// CORS
const corsOptions = {
    origin: CORS_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// resend verification
router.post("/resend-verification", cors(corsOptions), auth.isAuthenticated, (req, res) => {

    console.log(req.email);

    Verification.findOne({email: {$eq: req.email}}).then(async user => {
        if (!user) {
            console.log("Invalid verification link");
            return res.status(400).json({email: "Invalid verification link"});
        } else {

            let randId = user.key;
            let email = req.email;
            console.log(email);

            User.findOne({email: {$eq: email}}).then(async userData => {

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
                            '<h2>Hello, ' + userData.name + '</h2>' +
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
                            //'data-saferedirecturl="https://www.google.com/url?q=' + keys.PW_URL + 'forgot-change-password?id=' + randId + '"' +
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


                registerEmail().then(r => {
                    return res
                        .status(200)
                        .json({requestSent: "Password recovery link sent, Please check your email"});
                }).catch(err => {
                    return res
                        .status(404)
                        .json({errorsendingemail: "Error while sending email"});
                })

            }).catch(err33 => {
                console.log(err33);
            })

        }
    });
});

// user/settings - change password
router.route('/settings/password').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 3) {

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
                                    password: password
                                }).then(async data1 => {
                                    res.status(200).json(data1);
                                }).catch(err1 => {
                                    res.status(404).json(err1)
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

// token delete
router.route('/token-logout').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    let token = req.headers['x-access-token'];
    Token.deleteOne({user: {$eq: req.id}, token: {$eq: token}}).then((data3) => {
        res.status(200).json(data3)
    }).catch((error3) => {
        console.log(error3);
        return res
            .status(404)
            .json({internalError: "Unexpected error occurred! Please try again."});
    })

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

router.route('/security/csrf').get(cors(corsOptions), (req, res) => {
    res.send(req.csrfToken());
})

module.exports = router;