
const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model.js');

class UserManager {
    async registerUser(userData) {
        try {
            const { email, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await UserModel.create({ email, password: hashedPassword });
            return newUser;
        } catch (error) {
            throw new Error('Error registering user');
        }
    }

    async getUserByUsername(email) {
        try {
            const user = await UserModel.findOne({ email });
            return user;
        } catch (error) {
            console.log('Error obteniendo el usuario');
        }
    }

    async authenticateUser(email, password) {
        try {
            if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                return { email: 'adminCoder@coder.com', role: 'admin' };
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
            console.error('Error autenticando al usuario:', error);
            return null;
        }
    }
}

module.exports = UserManager;