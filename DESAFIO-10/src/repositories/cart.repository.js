const CartModel = require('../models/cart.model.js');

class CartRepository {
    async createCart() {
        try {
            const carritoNuevo = new CartModel({ products: [] });
            return await carritoNuevo.save();
        } catch (error) {
            throw new Error("Error al crear el carrito");
        }
    }

    async getCartById(cid) {
        try {
            return await CartModel.findById(cid).populate("products.product");
        } catch (error) {
            throw new Error("Error al obtener el carrito indicado");
        }
    }

    async updateCart(cart) {
        try {
            return await cart.save();
        } catch (error) {
            throw new Error("Error al actualizar el carrito");
        }
    }

    async deleteProductFromCart(cid, pid) {
        try {
            const carrito = await this.getCartById(cid);
            const existeProdIndex = carrito.products.findIndex(item => item.product.toString() === pid);

            if (existeProdIndex != -1) {
                carrito.products.splice(existeProdIndex, 1);
                carrito.markModified("products");
                return await carrito.save();
            } else {
                throw new Error("Producto no encontrado en el carrito");
            }
        } catch (error) {
            throw new Error("Error al eliminar producto del carrito");
        }
    }

    async clearCart(cid) {
        try {
            const carrito = await this.getCartById(cid);
            carrito.products = [];
            carrito.markModified("products");
            return await carrito.save();
        } catch (error) {
            throw new Error("Error al vaciar el carrito");
        }
    }
}

module.exports = CartRepository;