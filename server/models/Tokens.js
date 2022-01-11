const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TokenSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 1
    },
    date: {
        type: Date,
        required: true,
    }
});

const Token = mongoose.model("tokens", TokenSchema);
module.exports = Token;