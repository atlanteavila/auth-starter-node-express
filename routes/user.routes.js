import authJwt from '../middlewares/authJwt.js';
import userController from '../controllers/user.controller.js';

const userRoutes = function (app) {
    app.post("/api/user/info",
        [authJwt.verifyToken],
        userController.getUserInfo)
}

export default {
    userRoutes
}