const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require ('../../middleware/auth.js');
const Profile = require ('../../models/Profile.js');
const User = require ('../../models/User.js');
const Post = require ('../../models/Post.js');
const {check, validationResult} = require('express-validator');
require('dotenv').config();



// @route         GET api/profile/me
// @description   Get current users profile
// @access        Private

router.get('/me', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({'user': req.user.id}).populate('user', 
        ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile); 

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route         POST api/profile
// @description   Create or Update user profile
// @access        Private

router.post('/', [auth, [
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills is required').not().isEmpty(),
    
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {
        company,
        website,
        location, 
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter, 
        instagram,
        linkedin
    } = req.body;
     // Build profile object
     const profileFields = {};
     profileFields.user = req.user.id;
     if(company)profileFields.company = company;
     if(website)profileFields.website = website;
     if(location)profileFields.location = location;
     if(bio)profileFields.bio = bio;
     if(status)profileFields.status = status;
     if(githubusername)profileFields.githubusername = githubusername;
     if(skills){
         profileFields.skills = skills.split(',').map((skill) => ' ' + skill.trim()); 
     }
     

    //  Build Social Object
    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;
    // console.log(profileFields);
    try{
        let profile = await Profile.findOne({user: req.user.id});
        // console.log(req.user.id);

        if(profile){
            //  Update

            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }  
        // create
        profile = new Profile(profileFields);
        // console.log('123');
        await profile.save();
        return res.json(profile);
        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route         GET api/profile
// @description   Get all profiles
// @access        Public

router.get('/', async (req, res)=>{
    try {
        const profiles= await Profile.find().populate('user',['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route         GET api/profile/user/:user_id
// @description   Get profile by user id
// @access        Public

router.get('/user/:user_id', async (req, res)=>{
    try {
        const profile= await Profile.findOne( {user: req.params.user_id} ).populate('user',['name', 'avatar']);
        if(!profile)return res.status(400).json({msg:'Profile Not Found!'});
        res.json(profile);
    } catch (err) {
        console.error(err.name);
        if(err.name === 'CastError'){
            return res.status(400).json({msg:'Profile Not Found!'});
        }
        res.status(500).send("Server Error");
    }
});

// @route         DELETE api/profile
// @description   DELETE profile, user & posts
// @access        Private

router.delete('/', auth, async (req, res)=>{
    try {
        // Remove Posts
        await Post.deleteMany({user: req.user.id});
        // Remove Profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove User
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User Deleted'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route         PUT api/profile/experience
// @description   Add profile experience
// @access        Private

router.put('/experience', [auth,[
    check('title', "Title is required").not().isEmpty(),
    check('company', "Company is required").not().isEmpty(),
    check('from', "from Date is required").not().isEmpty(),
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {
        title, 
        company,
        location, 
        from,
        to,
        current,
        description
    }= req.body;
    const newExp={
        title, 
        company,
        location, 
        from,
        to,
        current,
        description
    }
    try {
        const profile= await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route         DELETE api/profile/experience/:exp_id
// @description   Delete experience from profile 
// @access        Private

router.delete('/experience/:exp_id', auth, async(req, res) => {
    try {
        const profile= await Profile.findOne({user: req.user.id});
        // Get remove Index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route         PUT api/profile/education
// @description   Add profile education
// @access        Private

router.put('/education', [auth,[
    check('school', "School is required").not().isEmpty(),
    check('degree', "Degree is required").not().isEmpty(),
    check('fieldofstudy', "Field Of Study is required").not().isEmpty(),
    check('from', "from Date is required").not().isEmpty(),
]], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const {
        school, 
        degree,
        fieldofstudy, 
        from,
        to,
        current,
        description
    }= req.body;

    const newEdu={
        school, 
        degree,
        fieldofstudy, 
        from,
        to,
        current,
        description
    }
    try {
        const profile= await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEdu);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route         DELETE api/profile/education/:edu_id
// @description   Delete education from profile 
// @access        Private

router.delete('/education/:edu_id', auth, async(req, res) => {
    try {
        const profile= await Profile.findOne({user: req.user.id});
        // Get remove Index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route         GET api/profile/github/:username
// @description   Get user repos from github 
// @access        Public
const githubClientId=process.env.GITHUB_CLIENT_ID;
const githubClientSecret=process.env.GITHUB_CLIENT_SECRET
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${
                githubClientId
            }&client_secret=${githubClientSecret}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };

        request(options, (error, response, body)=> {
            if(error)console.error(error);
            if(response.statusCode !== 200){
                return res.status(404).json({msg: 'No Github profile found'});
            }
            res.json(JSON.parse(body));
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
