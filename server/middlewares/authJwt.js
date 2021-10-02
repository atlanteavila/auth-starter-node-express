import jwt from 'jsonwebtoken'
import config from '../config.js'
import dbManager from '../database/index.js'
import { ObjectId } from 'mongodb'

export default () => ({
    verifyToken: (req, res, next) => {
        let token = req.headers['x-access-token']
        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'No token provided',
            })
        }
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    success: false,
                    message: `Unauthorized! ${err.message}`,
                })
            }
            req.userId = decoded.id
            next()
        })
    },

    isAdmin: (req, res, next) => {
        dbManager.findOne('users', { _id: ObjectId(req.userId) }).then((user) => {
            if (!user) {
                throw new Error('No user found')
            }

            dbManager.findOne('roles',
                {
                    _id: { $in: user.roles }
                })
                .then(roles => {
                    if (!roles) {
                        throw new Error('No roles matched')
                    }
                    if (roles.includes('admin')) {
                        next()
                        return
                    } else {
                        throw new Error('An admin role is required to perform that action.')
                    }
                })
                .catch(e => {
                    res.status(403).json({ success: false, message: `Error: ${e.message}` })
                })
        })
    },

    isModerator: (req, res, next) => {
        dbManager.findOne('users', { _id: ObjectId(req.userId) }).then((user) => {
            if (!user) {
                throw new Error('No user found')
            }

            dbManager.findOne('roles',
                {
                    _id: { $in: user.roles }
                })
                .then(roles => {
                    if (!roles) {
                        throw new Error('No roles matched')
                    }
                    if (roles.includes('moderator')) {
                        next()
                        return
                    } else {
                        throw new Error('An admin role is required to perform that action.')
                    }
                })
                .catch(e => {
                    res.status(403).json({ success: false, message: `Error: ${e.message}` })
                })
        })
    },
})