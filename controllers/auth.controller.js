import config from "../config.js";
import randtoken from 'rand-token';
import helpers from '../helpers/index.js';
import dbManager from "../database/index.js";
import { ObjectId } from "mongodb";
const refreshTokens = {};

const signup = async (req, res) => {
    const { username, email, password, roles } = req.body;
    if (!username || !email || !password) {
        throw new Error("Sorry, all fields are required.");
    }
    
    const getUserRoles = await dbManager.find('roles', { name: { $in: roles } });

    console.log(getUserRoles[0]._id)
    const user = {
        username,
        email,
        password: helpers.encryptPassword(password),
        roles: [getUserRoles[0]._id],
    }

    return dbManager.insertOne('users', user)
        .then((createdUser) => {
            const { username, email } = user;
            console.log(createdUser)
            res.status(200).send({
                success: true,
                message: 'User created.',
                data: {
                    username,
                    email
                },
            })
        })
        .catch(e => {
            return res.status(400).json({
                success: false,
                message: e.message,
            })
        })
};

const signin = (req, res) => {
    const { username } = req.body;
    dbManager.findOne('users',
        { username: username })
        .then(async (user) => {
            if (!user) {
                return res.code(404).json({
                    success: false,
                    message: 'Unable to find user.'
                })
            }
            const passwordIsValid = helpers.comparePasswords(req.body.password, user.password);
            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            const token = helpers.createJwt(user.id, config.secret);

            const roles = await dbManager.find("roles", {
                _id: {
                    $in: user.roles
                }
            })

            const refreshToken = randtoken.uid(256);
            refreshTokens[refreshToken] = username;

            const saveUserToken = {
                refreshToken: refreshToken,
                username: username,
            }

            dbManager.insertOne('refreshTokens', saveUserToken)

            res.status(200).json({
                id: user._id,
                username: user.username,
                email: user.email,
                roles,
                accessToken: token,
                refreshToken,
            });
        })
        .catch(e => console.log('error message', e.message));
};

const token = async (req, res) => {
    const { username, refreshToken } = req.body.data;
    if (!username) {
        res.status(400).json({
            success: false,
            message: 'A username is required.'
        })
    }
    const storedRefreshToken = await dbManager.findOne(
        'refreshTokens',
        { refreshToken: refreshToken },
    )
        .then(result => result)
        .catch(e => {
            console.log('Error', e.message);
            res.json({
                success: false,
                message: 'Invalid refresh token.',
                error,

            })
        });

    if ((storedRefreshToken)) {
        dbManager.findOne('users', {
            username: username,
        }).then(async (user) => {
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: "User Not found."
                });
            }

            const token = helpers.createJwt(user.id, config.secret)

            const roles = await dbManager.find("roles", {
                _id: {
                    $in: user.roles
                }
            })

            // generate new token and save;
            const newRefreshToken = randtoken.uid(256);

            const saveTokenDoc = {
                refreshToken: newRefreshToken,
                username: username,
            }
            await dbManager.insertOne('refreshTokens', saveTokenDoc)
                .catch(e => {
                    res.status(400).json({
                        success: false,
                        message: e.message,
                    })
                })
            await dbManager.deleteOne('refreshTokens', { refreshToken: refreshToken })
                .then(status => {
                    console.log('The delete status', status);
                    res.status(200).json({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: roles,
                        accessToken: token,
                        newRefreshToken,
                    });
                })
                .catch(e => {
                    res.status(400).json({
                        success: false,
                        message: e.message,
                    })
                })

        })
    } else {
        res.status(401).json({ success: false })
    }
}

export default {
    signin,
    signup,
    token,
}