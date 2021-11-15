const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt =require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User.js');

// @route         POST api/users
// @description   Register User
// @access        Public

router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min:6 })
    ],
    async(req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({'errors': errors.array()});
        }
        const{name, email, password} = req.body;

        try{
            let user = await User.findOne({'email': email});

            // see if user exists 
            if(user){
            return res.status(400).json({errors: [{msg: 'User Already Exists'}]});
            }
            
            // if user does not exist already only then the code below will run
            
            // get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            
            user = new User({
                name,
                email, 
                avatar,
                password
            });

            // encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            
            await user.save();

            // return json web token
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                {expiresIn: 3600},
                (err, token) =>{ 
                    if(err) throw err;
                    res.json({token});
            });

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error!');
        }
});


module.exports = router;
