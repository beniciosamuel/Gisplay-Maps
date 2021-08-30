import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as mailer from '../../modules/mailer.js';

import * as authConfig from '../../config/auth.js';

import User  from '../models/user.js';

function generateToken (params = {}) {
    return jwt.sign(params, authConfig.default.secret, {
        expiresIn: 86400,
    });
}

const router = express.Router();

router.post('/register', async (req, res) => {
    /* #swagger.tags = ['Auth']
     #swagger.description = 'Register the user with this route, to get access you must register the email an password. <br>
    A JSON object containing name, email, password and sector, must be send for this route'*/
    /* #swagger.parameters['example'] = { description: '{ \"name\": \"username\",  \"email\": \"useremail\", \"password\": \"password\", \"sector\": \"usersector\"}' } */
    const { email } = req.body;
    
    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'User already exists' })
        }           

        const user = await User.create(req.body);

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                emailConfirmToken: token,
                emailConfirmExpires: now,
                accessCredential: 'basic',
                statusEmail: 'unconfirmed',
            }
        });

        user.password = undefined;

        mailer.sendMail({
            to: email,
            from: 'samuel.multiplay@gmail.com',
            template: 'auth/confirm_email',
            context: { token }
        }, (err) => {
            if(err) {
                console.log(err);
                return res.status(400).send({ error: 'Cannot send confirm email'});
            }
                
            return res.status(200).send({ ok: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Registration failed' });
    }
})

router.post('/authenticate', async (req, res) => {
    /* #swagger.tags = ['Auth']
     #swagger.description = 'Authenticate a user with this route, to get access you must have registered the email and password.
    <br> A JSON object containing email and password must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"useremail\", \"password\": \"password\"}' } */
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+ email password statusEmail sector accessCredential access sign');

    if (!user) {
        return res.status(400).send({ error: 'User not found' })
    }

    if (!await bcrypt.compare(password, user.password)){
        return res.status(400).send({ error: 'Invalid password' })
    }

    if (user.statusEmail == 'unconfirmed') {
        return res.status(400).send({ error: 'User not confirm Email' })
    }

    await User.findByIdAndUpdate(user.id, {
        '$set': {
            sign: true
        }
    });

    user.password = undefined;
    
    res.status(200).send({
        user, 
        token: generateToken({ id: user.id }),
    })
})

/* When a user is register, a email to confirm this account is sent, to confirm this user, use this route.
A JSON object containing email and token of email confirm of the user must be send for this route. */
router.post('/email_confirm', async (req, res) => {
    /* #swagger.tags = ['Auth']
     #swagger.description = 'When a user is register, a email to confirm this account is sent, to confirm this user, use this route.
    <br> A JSON object containing email and token of email confirm of the user must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"useremail\", \"token\": \"token\"}' } */
    const { email, token, password } = req.body;
    console.log(token)
    console.log(email)

    try {
        const user = await User.findOne({ email })
         .select('+emailConfirmToken emailConfirmExpires');

        if(!user)
           return res.status(404).send({error: 'User not Found'}); 

        if (token !== user.emailConfirmToken)
            return res.status(403).send({ error: 'Token invalid' })
        
        const now = new Date()
        
        if (now > user.emailConfirmExpires){
            res.status(403).send({ error: 'Token expired, generate a new'});
        }
        
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                statusEmail: 'confirmed',
            }
        });

        res.status(200).send({
            ok: true
        })
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Cannot confirm email, try again' })
    }
})

router.post('/forgot_password', async (req, res) => {
    /* #swagger.tags = ['Auth']
     #swagger.description = 'When a user is forgot your password, a email to reset your secret is sent, to send this email, use this route.
    <br> A JSON object containing email of the user must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"useremail\" }' } */
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user)
            return res.status(400).send({error: 'User not Found'});
        
        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: email,
            from: 'samuelmultiplay@gmail.com',
            template: 'auth/forgot_password',
            context: { token }
        }, (err) => {
            if(err) {
                return res.status(400).send({ error: 'Cannot send forgot password email'});
            }                
            
            return res.status(200).send({ ok: true });
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({ error: "Error on forgot password, try again"})
    }
})

router.post('/reset_password', async (req, res) => {
    /* #swagger.tags = ['Auth']
     #swagger.description = 'When a user want reset your pass, a new token is generated, to confirm this token use this route.
    <br> A JSON object containing email, token of password confirm and new pass must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"useremail\", \"token\": \"token\", \"password\": \"password\"}' } */
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
         .select('+passwordResetToken passwordResetExpires');

        if(!user)
           return res.status(400).send({error: 'User not Found'}); 

        if (token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token invalid' })
        
        const now = new Date()
        
        if (now > user.passwordResetExpires){
            res.status(400).send({ error: 'Token expired, generate a new'});
        }            
        
       user.password = password;

        await user.save();

        res.status(200).send({ ok: true });
    } catch (err) {
        return res.status(400).send({ error: 'Cannot reset password, try again' })
    }
})

export default app => app.use('/auth', router);