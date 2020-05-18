jest.setTimeout(90000);
require("../models/User");

const keys = require("../config/keys");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI || "mongodb://127.0.0.1:27017/blog_ci", {
	useUnifiedTopology: true,
	useNewUrlParser: true,
});
