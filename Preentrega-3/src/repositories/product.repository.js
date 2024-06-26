const ProductModel = require('../dao/models/product.model.js');
const CustomError = require("../services/errors/custom-error.js");
const EErrors = require("../services/errors/enum.js");
const generarInfoError = require("../services/errors/info.js");

class ProductRepository {
    async addProduct(productData) {
        try {
            console.log("productData: ", productData);
            
            console.log("productData.code: ", productData.code);
            //primero nos aseguramos de que no exista el código
            const result = await this.getProductByCode(productData.code);
            console.log("result: ", result);

            if (result) {
                throw CustomError.crearError({
                    nombre: "Producto nuevo con algún valor vacío o erróneo",
                    causa: generarInfoError(productData),
                    mensaje: "Ya existe el código : " + productData.code,
                    codigo: EErrors.BD_ERROR
                })
            }

            const nuevoProducto = new ProductModel(productData);
            return await nuevoProducto.save();
        } catch (error) {
            return error;
        }
    }

    async getProducts() {
        try {
            return await ProductModel.find().lean();
        } catch (error) {
            throw new Error("Error al recuperar los productos");
        }
    }

    async getProductById(id) {
        try {
            console.log("dentro de productById. id recibido: ", id);
            const product = await ProductModel.findById(id).lean();
            return product
        } catch (error) {
            throw new Error("Error al recuperar el producto indicado");
        }
    }

    async getProductByCode(code) {
        try {
            console.log("code: ", code);
            return await ProductModel.findOne({ code: code });
        } catch (error) {
            console.error("Error al recuperar el producto indicado", error);
            throw new Error("Error al recuperar el producto indicado");
        }
    }

    async updateProduct(id, updatedProduct) {
        try {
            return await ProductModel.findByIdAndUpdate(id, updatedProduct);
        } catch (error) {
            throw new Error("Error al actualizar el producto");
        }
    }

    async deleteProduct(id) {
        try {
            return await ProductModel.findByIdAndDelete(id);
        } catch (error) {
            throw new Error("Error al eliminar el producto");
        }
    }

    async getPaginatedProducts(page, limit) {
        try {
            return await ProductModel.paginate({}, { page, limit });
        } catch (error) {
            throw new Error("Error al paginar los productos");
        }
    }
}

module.exports = ProductRepository;