import mongoose from 'mongoose';
import user from './user.model.js'
import role from './role.model.js'
import refreshToken from './refreshTokens.model.js';

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = user;
db.role = role;
db.refreshToken = refreshToken;

db.ROLES = ["user", "admin", "moderator"];

export default db;
