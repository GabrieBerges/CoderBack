const ProductModel = require('../dao/models/product.model.js');

class ProductRepository {
    async addProduct(productData) {
        try {
            console.log("productData: ", productData);
            const nuevoProducto = new ProductModel(productData);
            return await nuevoProducto.save();
        } catch (error) {
            throw new Error("Error al agregar el nuevo producto");
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