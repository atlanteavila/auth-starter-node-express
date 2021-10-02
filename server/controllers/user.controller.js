import dbManager from '../database/index.js'
export default (req, res) => {
    return dbManager.findOne('users', { username: req.body.username }, { 'username': 1, 'email': 1, 'roles': 1 })
        .then(result => {
            if (result) {
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
                console.log('No document matches the provided query.')
            }
            return result
        })
        .catch(e => res.status(400).json({
            success: false,
            message: e.message,
        }))
}