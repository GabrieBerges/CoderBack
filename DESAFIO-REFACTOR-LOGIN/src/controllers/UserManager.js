
const bcrypt = require('bcrypt');
const UserModel = require('../models/user.model.js');

class UserManager {
    async registerUser(userData) {
        try {
            const { username, password } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await UserModel.create({ username, password: hashedPassword });
            return newUser;
        } catch (error) {
            throw new Error('Error registering user');
        }
    }

    async getUserByUsername(username) {
        try {
            const user = await UserModel.findOne({ username });
            return user;
        } catch (error) {
            console.log('Error obteniendo el usuario');
        }
    }

    async authenticateUser(username, password) {
        try {
            if (username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
                return { username: 'adminCoder@coder.com', role: 'admin' };
            }
            const user = await this.getUserByUsername(username);

            if (!user) {
                return null;
            }

            const isPasswordMatch = await user.comparePassword(password);

            if (!isPasswordMatch) {
                return null;
            }

            return  { username: user.username, role: user.role };
        } catch (error) {
            console.error('Error autenticando al usuario:', error);
            return null;
        }
    }
}

module.exports = UserManager;