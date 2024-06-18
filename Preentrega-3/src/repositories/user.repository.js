const UserModel = require('../models/user.model.js');

class UserRepository {
    async createUser(datosUser) {
        try {
            return await UserModel.create({ email, password: hashedPassword });
        } catch (error) {
            throw new Error("Error al crear el usuario");
        }
    }

    async getUsers() {
        try {
            return await UserModel.find();
        } catch (error) {
            throw new Error("Error al obtener los usuarios");
        }
    }

    async getUserByEmail(email) {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            throw new Error("Error al obtener el usuario por email");
        }
    }
}

module.exports = UserRepository;
