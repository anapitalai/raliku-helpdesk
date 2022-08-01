const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validate = require('node-deep-email-validator');

const User = require('../models/userModel');
const UserVerification = require('../models/userVerification');

const nodemailer = require('nodemailer');
const uuid = require('uuid');
const userVerification = require('../models/userVerification');
require('dotenv').config();
const path = require('path');

//for the nodemailer
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASS
	}
});

//check if nodemailer is working
transporter.verify((error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log('ready for messaging');
		console.log(success);
	}
});

//function to send email verification
const sendEmailVerification = asyncHandler(async ({ _id, email }, res) => {
	console.log('Working');
	const uid = uuid.v4();

	const url = 'http://localhost:7000/';
	const uniqueString = uid + _id;
	console.log(uniqueString);
	const output = `
<p>Verify your email address to complete the signup. </p>
<p>This link expires in 6 hours.</p>
<p> Press <a href=${url + 'api/users/verify/' + _id + '/' + uniqueString}>here</a> to proceed.</p>
`;

	// setup email data with unicode symbols
	let mailOptions = {
		from: process.env.AUTH_EMAIL,
		to: email,
		subject: 'Verify your email',
		html: output
	};

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedUniqueString = await bcrypt.hash(uniqueString, salt);
	const new_UserVerification = await userVerification.create({
		userId: _id,
		uniqueString: hashedUniqueString,
		createdAt: Date.now(),
		expiresAt: Date.now() + 21600000
	});

	if (new_UserVerification) {
		transporter.sendMail(mailOptions);
		res.status(201).json({
			_id: new_UserVerification._id,
			uniqueString: new_UserVerification.hashedUniqueString,
			createdAt: new_UserVerification.createdAt,
			expiresAt: new_UserVerification.expiresAt,
			status: 'Pending'
		});
	} else {
		res.status(400);
		throw new error('Invalid Verification data');
	}

	//send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

		res.render('contact', { msg: 'Email has been sent' });
	});
});

// @desc    Verify email
// @route   /api/users/verify
// @access  Public
const getEmailVerification = asyncHandler(async (req, res) => {
	let { userId, uniqueString } = req.params;
	const userVerification = await UserVerification.findById({ userId });
	if (!userVerification) {
		res.status(400);
		throw new Error('An error occurred');
		 res.redirect('/user/verified/error=true&message=${message}');
	} else {
		if (result.length > 0) {
			//user record exists do proceed
			const { expiresAt } = result[0];
			if (expiresAt < Date.now()) {
				userVerification.deleteOne({ userId });
				throw new Error('An error occurred while clearing user verify record');
				return res.redirect('/user/verified/error=true&message=${message}');
			}
		} else {
			//user verification does not exist
			throw new Error('Account record does not exist');
			 res.redirect('/user/verified/error=true&message=${message}');
		}
	}
});

// @desc    email view page
// @route   /api/users/verified
// @access  Public
const getEmailVerified = asyncHandler(async (req, res) => {
	res.sendFile(path.join(__dirname, './../views/verfied.html'));
});

// @desc    Register a new user
// @route   /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	// Validation
	if (!name || !email || !password) {
		res.status(400);
		throw new Error('Please include all fields');
	}

	// Find if user already exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error('User already exists');
	}

	// Hash password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	// Create user
	const user = await User.create({
		name,
		email,
		password: hashedPassword,
		verified: false
	});
	console.log('email triggered!');

	if (user) {
		//handle account verify
		await sendEmailVerification(user, res);

		return res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id),
			verified: user.verified
		});
	} else {
		 return;
		 //res.status(400);
		// throw new error('Invalid user data');
		 

	}
});

// @desc    Login a user
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	// Check user and passwords match
	if (user && (await bcrypt.compare(password, user.password))) {
		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			token: generateToken(user._id)
		});
	} else {
		res.status(401);
		throw new Error('Invalid credentials');
	}
});

// @desc    Get current user
// @route   /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
	const user = {
		id: req.user._id,
		email: req.user.email,
		name: req.user.name
	};
	res.status(200).json(user);
});

// Generate token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: '30d'
	});
};

module.exports = {
	registerUser,
	loginUser,
	getMe,
	getEmailVerification,
	getEmailVerified
};
