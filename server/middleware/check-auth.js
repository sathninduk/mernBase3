const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/User");
const Token = require("../models/Tokens");

module.exports = {

    isAuthenticated: function (req, res, next) {
        const token = req.headers['x-access-token'];
        //req.body.token ||
        //req.query.token ||
        //req.cookies.token;
        if (!token) {
            res.status(401).send('Unauthorized: No token provided');
        } else {

            jwt.verify(token, keys.secretOrKey, function (err, decoded) {
                if (err) {
                    console.log(err, "error")
                    res.status(401).send('Unauthorized: Invalid token');
                } else {

                    User.findOne({
                        _id: {$eq: decoded.id},
                        email: {$eq: decoded.email},
                        status: 1
                    }).limit(1).then((data3) => {

                        if (data3) {

                            Token.findOne({
                                user: {$eq: decoded.id},
                                token: {$eq: token},
                                status: 1
                            }).then((data4) => {

                                if (data4) {

                                    // set
                                    let set_date = data4.date.setSeconds(data4.date.getSeconds());
                                    // now
                                    let cur_time = new Date();
                                    let now_date = cur_time.setSeconds(cur_time.getSeconds())
                                    // die
                                    let die_date = data4.date.setSeconds(data4.date.getSeconds() + 31556926);
                                    if (now_date <= die_date && now_date >= set_date) {
                                        req.id = decoded.id;
                                        req.name = decoded.name;
                                        req.tel = decoded.tel;
                                        req.email = decoded.email;
                                        req.role = decoded.role;
                                        next();
                                    } else {
                                        return res.status(401).send('Unauthorized: Invalid token');
                                    }

                                } else {
                                    return res.status(401).send('Unauthorized: Invalid token');
                                }

                            }).catch((error4) => {
                                return res.status(401).send('Unauthorized: Invalid token');
                            })

                        } else {
                            return res.status(401).send('Unauthorized: Invalid token');
                        }

                    }).catch((error3) => {
                        return res.status(401).send('Unauthorized: Invalid token');
                    })

                }
            });


        }
    },


    getUserData: function (req, res, next) {
        const token = req.headers['x-access-token'];
        //req.body.token ||
        //req.query.token ||
        //req.headers['x-access-token'] ||
        //req.cookies.token;
        if (!token) {
            res.status(401).send('Unauthorized: No token provided');
        } else {
            jwt.verify(token, keys.secretOrKey, function (err, decoded) {
                req.id = decoded.id;
                req.name = decoded.name;
                req.tel = decoded.tel;
                req.email = decoded.email;
                req.role = decoded.role;
                next();
            });
        }
    }
};
