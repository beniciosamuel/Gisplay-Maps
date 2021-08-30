import express from 'express';
import crypto from 'crypto';
import * as mailer from '../../modules/mailer.js';
import authMiddleware from '../middlewares/auth.js'

import User  from '../models/user.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/access-map', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'This route is necessary to ensure access to maps with credentials only.'*/
     
    res.status(200).send({ ok:true });
})

router.put('/upgrade', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Use this route to upgrade level of the your user.
    <br> A JSON object containing email of the admin and of the employee must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\", \"userUpdate\": \"emailslayer\"}' } */
    const { email, userUpdate } = req.body;

    try {
        const admin = await User.findOne({ email });
        const slayer = await User.findOne({ "_id": userUpdate });

        if (!admin) {
            return res.status(400).send({ error: 'Admin not found' });
        }

        if (admin.sector != "projetos") {
            return res.status(401).send({ error: 'The sector dont have permission to upgrade a User for this level' });
        }

        if (!slayer) {
            return res.status(400).send({ error: 'User to upgrade not found' });
        }

        await User.findByIdAndUpdate(slayer.id, {
            '$set': {
                accessCredential: "premium",
            }
        });

        return res.status(200).send({ ok: true })
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Cannot upgrade the user, an error has occurred" })
    }
});

router.post('/forgot', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Admins can send a email to reset a password for the your employee, use this route for this.
    <br> A JSON object containing email of the admin and of the employee must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\", \"userResetPass\": \"idslayer\"}' } */
    const { email, userResetPass } = req.body;

    try {
        const admin = await User.findOne({ "email": email });
        const slayer = await User.findOne({ "_id": userResetPass });
        if (!admin) {
            return res.status(403).send({ error: 'Admin not found' });
        }
        
        if (admin.accessCredential != "premium") {
            return res.status(403).send({ error: 'User is not admin' });
        }

        if (!slayer) {
            return res.status(404).send({ error: 'User to reset pass not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(slayer.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        });

        mailer.sendMail({
            to: slayer.email,
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
        console.log(err);
        res.status(400).send({ error: "Cannot send email for reset password" })
    }
})

router.post('/reset_confirm', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Use this route to resend email to confirm account of the your user.
    <br> A JSON object containing email of the admin and of the employee must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\", \"userResetPass\": \"emailslayer\"}' } */
    const { email, userToConfirm } = req.body;

    try {
        const admin = await User.findOne({ "email": email });
        const slayer = await User.findOne({ "email": userToConfirm });

        if (!admin) {
            return res.status(403).send({ error: 'Admin not found' });
        }
        
        if (admin.accessCredential != "premium") {
            return res.status(403).send({ error: 'User is not admin' });
        }

        if (!slayer) {
            return res.status(404).send({ error: 'User to confirm email not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(slayer.id, {
            '$set': {
                emailConfirmToken: token,
                emailConfirmExpires: now
            }
        });

        mailer.sendMail({
            to: userToConfirm,
            from: 'samuelmultiplay@gmail.com',
            template: 'auth/confirm_email',
            context: { token }
        }, (err) => {
            if(err) {
                return res.status(400).send({ error: 'Cannot send confirm email'});
            }
                
            return res.status(200).send();
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Cannot send confirm email to the user" })
    }
})

router.put('/release', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Project sector admins can manage all users and make anyone an administrator.
    <br> A JSON object containing email of the admin and of the employee must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\", \"userUpdate\": \"idslayer\"}' } */
    const { email, userUpdate } = req.body;
    console.log(email);

    try {
        const admin = await User.findOne({ "email": email });
        const slayer = await User.findOne({ "_id": userUpdate });

        if (!admin) {
            return res.status(404).send({ error: 'Admin not found' });
        }

        if (!slayer) {
            return res.status(404).send({ error: 'User to upgrade not found' });
        }

        await User.findByIdAndUpdate(slayer.id, {
            '$set': {
                access: true,
            }
        });

        return res.status(200).send({ ok: true })
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: "Cannot upgrade the user, an error has occurred" })
    }
});

router.delete('/reject', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Admins can exclude anyone from their sector, be careful when managing.
    <br> A JSON object containing email of the admin and of the employee must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\", \"userRemove\": \"useremail\"}' } */
    const { email, userRemove } = req.body;

    try {
        const userUp = await User.findOne({ email });
        const userDel = await User.findOne({ "_id": userRemove });

        if (!userUp) {
            return res.status(404).send({ error: 'User not found' })
        }

        if (!userDel) {
            return res.status(404).send({ error: 'User for removal not found' })
        }

        if (userUp.accessCredential != 'premium') {
            console.log(userUp.accessCredential);
            return res.status(403).send({ error: 'User dont have permission for this request' });
        }

        userDel.remove(() => {
            res.status(200).send({ ok: true });
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Cannot remove the User'});
    };
});

router.post('/getall', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Admins can getall anyone from their sector, be careful when managing.
    <br> A JSON object containing email and sector of the admin must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\" }' } */
    const { email } = req.body;
    const arrUsers = []
    console.log(req.body)

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'User not found' })
        }

        if (user.sector == 'projetos') {
            for await (const users of User.find()) {
                arrUsers.push(users);
            }
        } else {
            for await (const users of User.find({ "sector": user.sector })) {
                arrUsers.push(users);
            }
        }

        return res.status(200).send(arrUsers)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Cannot make a query of users" })
    }
})

router.post('/get-pendents', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'Admins can getpendents from their sector, be careful when managing.
    <br> A JSON object containing email and sector of the admin must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"adminemail\" }' } */
    const { email } = req.body;
    const arrUsers = [];

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: 'User not found' })
        }

        if (user.sector == 'projetos') {
            for await (const users of User.find({ access: false})) {
                arrUsers.push(users);
            }
        } else {
            for await (const users of User.find({ sector: user.sector, access: false})) {
                arrUsers.push(users);
            }
        }

        return res.status(200).send(arrUsers)
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: "Cannot make a query of users" })
    }
})

router.post('/sign-out', async (req, res) => {
    /* #swagger.tags = ['Logged']
     #swagger.description = 'To sign out a user.
    <br> A JSON object containing email of the user must be send for this route.'*/
    /* #swagger.parameters['example'] = { description: '{ \"email\": \"useremail\" }' } */
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).send({ error: 'User not found' })
        }

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                sign: false,
            }
        });

        return res.status(200).send({ ok:true })
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'User cannot dislog' })
    }
})

export default app => app.use('/projects', router);