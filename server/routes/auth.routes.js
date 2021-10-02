import verifySignUp from '../middlewares/index.js'
import authController from '../controllers/auth.controller.js'
const authRoutes = function (app) {

    app.post(
        '/api/auth/signup',
        [
            verifySignUp.verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.verifySignUp.checkRolesExisted
        ],
        authController.signup
    )

    app.post(
        '/api/auth/signin',
        authController.signin
    )
    app.post(
        '/api/auth/token',
        authController.token
    )
}
export default {
    authRoutes
}
