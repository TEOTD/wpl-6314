"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const userSchema = new mongoose.Schema({
    login_name: {type: String, required: true, unique: true},
    password_digest: {type: String, required: true},
    salt: {type: String, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    location: String,
    description: String,
    occupation: String,
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;
