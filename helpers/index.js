import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

const helpers = {};

helpers.initial = function () {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'moderator' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}

helpers.createJwt = (id, secret) => {
    return jwt.sign({ id }, secret, {
        expiresIn: '1M'
    });
}

helpers.encryptPassword = (password) => bcrypt.hashSync(password, 8);

helpers.comparePasswords = (password, comparedPassword) => bcrypt.compareSync(password, comparedPassword);

helpers.ROLES = ["user", "admin", "moderator"];

export default helpers;