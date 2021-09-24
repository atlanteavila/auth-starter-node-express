export default (dbs) => (req, res) => {
    console.log('dbs.mainDb', dbs);
    return dbs.appDb.collection('users').findOne({ username: req.body.username }, { "username": 1, "email": 1, "roles": 1})
        .then(result => {
            if (result) {
                console.log(`Successfully found document: ${result}.`);
                res.status(200).json({
                    success: true,
                    message: 'Found user',
                    data: {
                        username: result.username,
                        email: result.email,
                        roles: result.roles,
                    },
                })
            } else {
                console.log("No document matches the provided query.");
            }
            return result;
        })
        .catch(e => res.status(400).json({
            success: false,
            message: e.message,
        }))
}
    /* return User.findOne({
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
}) */

/* import db from '../models/index.js'
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
} */