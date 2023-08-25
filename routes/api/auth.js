const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const config = require('config');
require('dotenv').config();


// @route         GET api/auth
// @description   test route
// @access        Public

router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        
        res.json(user); 
    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route         POST api/auth
// @description   Authenticate User
// @access        Public

router.post('/',[
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
    ],
    async(req, res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({'errors': errors.array()});
        }
        const{email, password} = req.body;

        try{
            let user = await User.findOne({'email': email});

            // see if user exists 
            if(!user){
                return res.status(400)
                .json({errors: [{msg: 'Invalid Credentials'}]});
            }
            
            const isMatch = await bcrypt.compare(password, user.password); 

            if(!isMatch){
                return res.status(400)
                .json({errors: [{msg: 'Invalid Credentials'}]});
            }

            // return json web token
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
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
