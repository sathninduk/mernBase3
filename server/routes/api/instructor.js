const express = require("express");
const router = express.Router();

// Load models
const User = require("../../models/User");

// middleware
const auth = require('../../middleware/check-auth');
const bcrypt = require("bcryptjs");
const cors = require('cors')

// validation
const validateChangePasswordInput = require("../../validation/change-pw");


// validation
const CORS_URL = require("../../config/keys").CORS_URL;
// CORS
const corsOptions = {
    origin: CORS_URL,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// admin/settings - change password
router.route('/settings/password').post(cors(corsOptions), auth.isAuthenticated, (req, res) => {
    if (req.role == 2) {

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


module.exports = router;