
const bcrypt = require('bcrypt');
const passport = require("passport");
const configObject = require("../../config/config.js");
const { logger } = require('../../utils/config_logger.js');
const { generarResetToken } = require('../../utils/tokenreset.js');
const { createHash, isValidPassword } = require("../../utils/hashbcrypt.js");
const { UserService } = require("../../services/index.js");

const EmailManager = require("../../services/email.js");
const UserModel = require('../models/user.model.js');
const emailManager = new EmailManager();

const upload = require("../../middleware/multer.js");

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

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

            return { email: user.email, role: user.role };
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
                // return res.redirect('/?success=true&process=registrado');// Redirige a la página de éxito
                return res.redirect('/?success=true');
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

        //Actualizamos last_connection
        const now = dayjs().tz("America/Argentina/Buenos_Aires").utc();

        req.user.last_connection = now.toDate();
        logger.error("user.last_connection")
        logger.error(req.user.last_connection)
        await req.user.save();

        logger.info(`req.session.user: ${JSON.stringify(req.session.user, null, 2)}`)
        logger.info(`req.session.login: ${JSON.stringify(req.session.login, null, 2)}`)

        res.redirect("/products");
        // res.redirect("/api/sessions/current");
    }

    async logout(req, res) {
        try {
            logger.error(req.session.user.email)
            const email = req.session.user.email
            let user = await UserService.getUserByEmail(email);

            const now = dayjs().tz("America/Argentina/Buenos_Aires").utc();
            user.last_connection = now.toDate();
            await user.save();
    
            req.session.destroy(async (err) => {
                if (err) {
                    logger.error(`Error destroying session: ${err.message}\n${err.stack}`);
                    res.status(500).send('Error destroying session');
                } else {
                    res.redirect('/');
                }
            });
        } catch (error) {
            logger.error(error);
            throw new Error("Error al obtener el usuario por email");
        }
    }

    githubCallback(req, res) {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/products");
    }

    async requestPasswordReset(req, res) {
        const { email } = req.body;
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }
            const token = generarResetToken();
            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000) //3600000 = En una hora expira
            }
            await user.save();
            await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);
            res.redirect("/password");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }


    async resetPassword(req, res) {
        const { email, password, token } = req.body;
        try {
            const user = await UserModel.findOne({email});
            if (!user) {
                return res.render("newpassword", {error: "Usuario no encontrado"});
                }
            const resetToken = user.resetToken;
            if (!resetToken || resetToken.token !== token) {
                return res.render("resetpass", {error: "El token es invalido"});
                } 
            const ahora = new Date();
            if (ahora > resetToken.expire) {
                return res.render("resetpass", {error: "El token expiro"});
            }
            if (isValidPassword(password, user)) {
                return res.render("newpassword", {error: "La nueva contraseña no puede ser igual a la anterior"});
            }
            user.password = createHash(password);
            user.resetToken = undefined;

            await user.save();
            return res.redirect('/?success=true');
            // return res.redirect('/?success=true&process=restablecido');
        } catch (error) {
            res.status(500).render("resetpass", {error: "Error interno del servidor"});
        }
    }


    async changeRole(req, res) {
        const uid = req.params.uid;
        logger.info(`uid: ${uid}`)

        if (!uid) {
            return res.status(400).send("Id de usuario inválido");
        }

        try {
            const user = await UserService.getUserById(uid)
            console.log(user)
            if (!user) {
                return res.status(400).send("Usuario no encontrado");
            }

            let newRole = "";

            if (user.role == "usuario") {
                if (!user.documents) {
                    return res.status(401).send({"error":"El usuario no posee la documentación completa"});
                }
    
                // verificar si cargó los documentos: identificación, comprobante de domicilio, comprob. de estado de cuenta. Caso contrario, mostrar error de carga incompleta.  
                const required_documents = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
                const user_documents = user.documents.map(doc => doc.name.split('.')[0]);
                logger.error(user_documents)
                const doc_ok = required_documents.every(doc => user_documents.includes(doc));
                logger.error(doc_ok)
                if (!doc_ok) {
                    return res.status(401).send({"error":"El usuario no posee la documentación completa"});
                }

                newRole = "premium";

            } else { 
                logger.info("El usuario ya es premium")
                newRole = "usuario";
            }
        
            const actualized = await UserService.updateUser(uid, {role: newRole});
            actualized.role = newRole; //lo actualizo porque sino en el log venía el anterior rol
            console.log(actualized)
            logger.info(`El usuario ahora tiene el rol de ${newRole}`);
            res.json(actualized)
        } catch (error) {
            logger.error(`Error autenticando alcambiando el rol del usuario: ${error.message}\n${error.stack}`);
            return null;
        }
    }


    async uploadDocuments(req, res) {
        try {
            const { uid } = req.params;
            const uploadedDocuments = req.files;
    
            if (!uploadedDocuments || Object.keys(uploadedDocuments).length === 0) {
                logger.info("No se han subido archivos");
                return res.status(400).send("No se han subido archivos");
            }
    
            const user = await UserService.getUserById(uid);
            if (!user) {
                return res.status(404).send("Usuario no encontrado");
            }
            
            if (uploadedDocuments) {
                logger.info("en uploadeddocuments");
                if (uploadedDocuments.document) {
                    user.documents = user.documents.concat(uploadedDocuments.document.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
                
                if (uploadedDocuments.products) {
                    user.documents = user.documents.concat(uploadedDocuments.products.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
                
                if (uploadedDocuments.profile) {
                    user.documents = user.documents.concat(uploadedDocuments.profile.map(doc => ({
                        name: doc.originalname,
                        reference: doc.path
                    })));
                }
            }
    
            await user.save();
            
            res.status(200).send("Documentos cargados exitosamente");
        } catch (error) {
            logger.error(error);
            res.status(500).send("Error interno del servidor");
        }
    };

}

module.exports = UserManager;