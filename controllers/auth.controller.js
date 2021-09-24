import config from "../config.js";
import db from "../models/index.js";
import randtoken from 'rand-token';
import helpers from '../helpers/index.js';
import dbManager from "../database/index.js";
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;

const refreshTokens = {};

const signup = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new Error("Sorry, all fields are required.");
    }
    const user = new User({
        username,
        email,
        password: helpers.encryptPassword(password)
    });

    // bcrypt.hashSync(password, 8)

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err.message });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err.message });
                        return;
                    }

                    user.roles = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err.message });
                            return;
                        }

                        res.json({
                            success: true,
                            message: "User was registered successfully!"
                        });
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err.message });
                    return;
                }

                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err.message });
                        return;
                    }

                    res.json({ message: "User was registered successfully!" });
                });
            });
        }
    });
};

const signin = (req, res) => {
    const { username } = req.body;
    dbManager.aggregate();
    dbManager.findOne('users',
        { username: username },
        {
            $lookup: {
                "from": "roles",
                "let": { "roles": "$id" },
                pipeline: [
                    {
                        "$match": {
                            "$expr": {
                                "$in": ["$$roles", "$users.id"],
                            },
                        },
                    },
                ],
                as: "user_roles"
            }
        }).then(async (user) => {
            console.log('The user is here', user);
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
    const storedRefreshToken = await RefreshToken.findOne({
        refreshToken: refreshToken
    })
        .then(token => token)
        .catch((error) => {
            res.json({
                success: false,
                message: 'Invalid refresh token.',
                error,

            })
        });

    if ((storedRefreshToken)) {
        User.findOne({
            username: username,
        }).populate("roles", "-__v")
            .exec((err, user) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: err
                    });
                    return;
                }

                if (!user) {
                    return res.status(404).send({
                        success: false,
                        message: "User Not found."
                    });
                }

                const token = helpers.createJwt(user.id, config.secret)

                const authorities = [];

                for (let i = 0; i < user.roles.length; i++) {
                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
                }
                // generate new token and save;
                const newRefreshToken = randtoken.uid(256);

                const saveToken = {
                    refreshToken: newRefreshToken,
                    username: username,
                }
                const refresh = new RefreshToken(saveToken);

                refresh.save((err) => {
                    if (err) {
                        throw new Error('Unable to save the user');
                    }
                })
                RefreshToken.findOneAndDelete({
                    refreshToken: refreshToken
                })
                    .catch(e => res.status(400).json({
                        success: false,
                        message: 'Unable to update refesh token',
                    }))

                res.status(200).json({
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token,
                    newRefreshToken,
                });
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