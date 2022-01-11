const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const VerificationSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date(),
        required: true
    }
});

const Verification = mongoose.model("verifications", VerificationSchema);
module.exports = Verification;