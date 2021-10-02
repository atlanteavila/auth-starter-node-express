import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dbManager from '../database/index.js'

const helpers = {}

helpers.initial = async function () {
    const rolesCount = await dbManager.count('roles')
        .then(count => count)
        .catch(e => console.dir(e))

    if (rolesCount === 0) {
        dbManager.insertMany('roles', [
            { name: 'admin' },
            { name: 'user' },
            { name: 'moderator' }
        ])
            .then(results => console.log(results))
            .catch(e => console.log('there was an error ', e.message))
    }
}

helpers.createJwt = (id, secret) => {
    return jwt.sign({ id }, secret, {
        expiresIn: '200M'
    })
}

helpers.encryptPassword = (password) => bcrypt.hashSync(password, 8)

helpers.comparePasswords = (password, comparedPassword) => bcrypt.compareSync(password, comparedPassword)

helpers.ROLES = ['user', 'admin', 'moderator']

export default helpers