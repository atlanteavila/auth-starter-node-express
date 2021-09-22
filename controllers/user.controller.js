import db from '../models/index.js'
const User = db.user;

export const getUserInfo = (req, res) => {
    return User.findOne({
        username: req.body.username
    })
        .then(user => {
            const {
                username,
                email,
                roles,
            } = user;
            return res.status(200).json({
                success: true,
                message: 'user found',
                info: {
                    username,
                    email,
                    roles
                },
            })
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                message: err.message,
            })
        })
}

export default {
    getUserInfo,
}