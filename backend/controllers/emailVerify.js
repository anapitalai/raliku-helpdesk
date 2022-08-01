	//let reges = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(raliku.com|pnguot.ac.pg)$/;

	// const emailChecker = async () => {
	// 	let { valid, result, reason, validators } = await validate(email);
	// 	const r = reges.test(email);
	// 	console.log(r,result);
	// 	if (!r) {
	// 		res.status(400);
	// 		throw new Error('Members only!!');

	// 	} else if (!result) {
	// 		res.status(400);
	// 		throw new Error('The email address is not legitimate');
	// 	} else if (!name || !email || !password) {
	// 		res.status(400);
	// 		throw new Error('Please include all fields');
	// 	} else {
	// 		// Find if user already exists
	// 		const userExists = await User.findOne({ email });

	// 		if (userExists) {
	// 			res.status(400);
	// 			throw new Error('User already exists');
	// 		}
	// 		// Hash password
	// 		const salt = await bcrypt.genSalt(10);
	// 		const hashedPassword = await bcrypt.hash(password, salt);

	// 		// Create user
	// 		const user = await User.create({
	// 			name,
	// 			email,
	// 			password: hashedPassword
	// 		});

	// 		if (user) {
	// 			res.status(201).json({
	// 				_id: user._id,
	// 				name: user.name,
	// 				email: user.email,
	// 				token: generateToken(user._id)
	// 			});
	// 		} else {
	// 			res.status(400);
	// 			throw new error('Invalid user data');
	// 		}
	// 	}
	// }; //checker

	//emailChecker();