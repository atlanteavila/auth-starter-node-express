import dbManager from '../database/index.js';
import helpers from '../helpers/index.js';

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    // Username
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).send({ success: false, message: 'Sorry, username and emails are required.' })
    }
    const usernameExists = await dbManager.findOne('users', {
        username: req.body.username,
    })
        .then(result => result)
        .catch(e => console.dir(e))

    if (usernameExists) {
        return res.status(400).json({
            success: false,
            message: 'The user already exists.'
        })
    }
    const emailExists = await dbManager.findOne('users', {
        email: req.body.email,
    })
        .then(result => result)
        .catch(e => console.dir(e))

    if (emailExists) {
        return res.status(400).json({
            success: false,
            message: 'The user already exists.'
        })
    }

    next();
};

const checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let role of req.body.roles) {
            if (!helpers.ROLES.includes(role)) {
                res.status(400).json({
                    success: false,
                    message: `Failed! you're passing an invalid role.`,
                });
            }
        }
    }
    next();
};

export default {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};