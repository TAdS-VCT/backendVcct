const express = require('express');
const router = express.Router();
const User = require('../models/userSchema');
const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtsecret = "xyz123";
const nodemailer = require("nodemailer");
const fetchuser = require('../middleware/fetchlogin');

// Route 1: Method :'POST' , Register or Create a New User. 
router.post('/createuser', [
    body('name').isLength({ min: 4 }),
    body('email').isEmail(),
    body('rollno').isLength({ min: 9 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    const mailer = (email, pcode) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: 'tads.vct2022@gmail.com',
                pass: 'tadsiitkgp',
            },
        });

        var mailOptions = ({
            from: 'tads.vct2022@gmail.com',
            to: `${email}`,
            subject: "Hello from TAdS✔",
            text: "Hello world?",
            html: `<h1><b>Your PassCode is <i>${pcode}</i></b><h1>`,
        });
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error, "error in transporter");
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
    }
    try {
        // let success = false;
        let user = await User.findOne({ email: req.body.email, rollno: req.body.rollno });
        let success = false;
        if (user) {
            return res.status(400).json({ success, error: "Enter the Valid Credentials0000" });
        }
        let pcode = Math.floor((Math.random() * 10000) + 1);
        pcode = pcode.toString();
        user = await User.create({
            name: req.body.name,
            rollno: req.body.rollno,
            email: req.body.email,
            passcode: pcode,
            tokens: "",
            userRiddleIndex: 0
        })
        // localStorage.setItem("count", 0);
        mailer(req.body.email, pcode);
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, jwtsecret);
        success = true;
        res.json({ success, authToken })

    } catch (error) {
        console.error(error.message, "---error in token");
        res.status(500).send("Some Internal Server**** Error1");
    }

})

// Route 2: Method :'POST' , Login the Existing User.
router.post('/loginuser', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('passcode', 'Passcode cannot be blank').isLength({ min: 2 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // let success = true;
    const { email, passcode } = req.body;
    try {
        //,
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Enter the Valid Credentials1" });
        }
        const PassComp = await passcode.localeCompare(user.passcode);
        if (PassComp !== 0) {
            success = false;
            return res.status(400).json({ success, error: "Enter the Valid Credentials" });

        }
        let data = user.id;
        // console.log(data);
        const authToken = jwt.sign(data, jwtsecret);
        // console.log(authToken);
        const result = await User.findByIdAndUpdate({ _id: data }, {
            $set: {
                tokens: authToken
            }
        });
        // console.log(result);
        res.cookie("jwtToken", authToken, {
            httpOnly: true
        });
        success = true;
        res.json({ success, authToken })

    } catch (error) {
        console.error(error.message, "*******error in token");
        res.status(500).send("Some Internal Server---- Error");
    }

})

// ROUTE 3: Get Loggedin user details using: POST 
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);

        res.json(user);
        // console.log(dataname);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Internal Server Error");
    }
})

// ROUTE 4: Update count using: PUT 
router.put('/updatecount', fetchuser, async (req, res) => {
    try {
        const userId = req.user;
        const countuser = req.count;
        // res.json(user);
        const result = await User.findByIdAndUpdate({ _id: userId }, {
            $set: {
                userRiddleIndex: countuser
            }
        });
        // console.log(result);
        const user = await User.findById(userId);
        res.json(user);
        // console.log(dataname);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Internal Server Error");
    }
})


module.exports = router;
