
const bcrypt = require('bcrypt');
const passport = require("passport");
const configObject = require("../../config/config.js");
const { logger } = require('../../utils/config_logger.js');

const { UserService } = require("../../services/index.js");

class UserManager {
    async registerUser(userData) {
        try {
            const { email, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);

            return await UserService.createUser({ email, password: hashedPassword });
        } catch (error) {
            throw new Error('Error registering user');
        }
    }

    async getUserByUsername(email) {
        try {
            return await UserService.getUserByEmail({ email });
        } catch (error) {
            logger.info('Error obteniendo el usuario');
        }
    }

    async authenticateUser(email, password) {
        try {
            if (email === configObject.admin_user && password === configObject.admin_password) {
                return { email: configObject.admin_user, role: 'admin' };
            }
            const user = await this.getUserByUsername(email);

            if (!user) {
                return null;
            }

            const isPasswordMatch = await user.comparePassword(password);

            if (!isPasswordMatch) {
                return null;
            }

            return  { email: user.email, role: user.role };
        } catch (error) {
            logger.error(`Error autenticando al usuario: ${error.message}\n${error.stack}`);
            return null;
        }
    }

    register(req, res, next) {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.error = info.message;  // Almacena el mensaje de error en la sesión
                return res.redirect('/register');  // Redirige a la página de registro
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect('/?success=true');  // Redirige a la página de éxito
            });
        })(req, res, next);
    }

    async login(req, res) {
        logger.info("en user/login");
        logger.info(`req.user: ${JSON.stringify(req.user, null, 2)}`)
        if (!req.user) {
            return res.status(400).send("Credenciales invalidas");
        }
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
            cart: req.user.cart
        };

        req.session.login = true;

        logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
        logger.info(`req.session.login: ${JSON.stringify(req.session.login, null, 2)}`)

        res.redirect("/products");
        // res.redirect("/api/sessions/current");
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                logger.error(`Error destroying session: ${err.message}\n${err.stack}`);
                res.status(500).send('Error destroying session');
            } else {
                res.redirect('/'); 
            }
        });
    }

    githubCallback(req, res) {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/products");
    }
    
}

module.exports = UserManager;