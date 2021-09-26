import authJwt from '../middlewares/authJwt.js';
import userController from '../controllers/user.controller.js';

const userRoutes = function (app, dbs) {
    app.post("/api/user/info",
        [authJwt(dbs).verifyToken],
        userController)
}

export default {
    userRoutes
}