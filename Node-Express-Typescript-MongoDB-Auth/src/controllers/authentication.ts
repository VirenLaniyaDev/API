import express from 'express'
import { random, authentication } from '../helpers/authentication'
import { createUser, getUserByEmail } from '../models/user';

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.sendStatus(400);
        }

        const user = await getUserByEmail(email).select('+authentication.password +authentication.salt');

        if (!user) {
            return res.sendStatus(400);
        }

        // Verifying password
        const expectHash: String = authentication(user.authentication.salt, password);

        if (expectHash !== user.authentication.password) {
            return res.sendStatus(403);
        }

        // Storing Session token to Database and set into Cookies
        const salt = random();

        user.authentication.sessionToken = authentication(salt, user._id.toString());
        await user.save()

        res.cookie('NETM-AUTH-TOKEN', user.authentication.sessionToken, { domain: 'localhost', path: '/' })

        return res.status(200).json(user).end();
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.sendStatus(400);
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.sendStatus(400);
        }

        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password),
            }
        })

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}