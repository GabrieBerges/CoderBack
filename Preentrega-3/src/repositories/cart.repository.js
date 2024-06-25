const CartModel = require('../dao/models/cart.model.js');

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
            console.log("en repository");
            const carrito = await this.getCartById(cid);
            console.log("carrito: ", carrito);
            const existeProdIndex = carrito.products.findIndex(item => item.product._id.toString() === pid);
            console.log("existeProdIndex: ", existeProdIndex);

            if (existeProdIndex != -1) {
                carrito.products.splice(existeProdIndex, 1);
                carrito.markModified("products");
                return await carrito.save();
            } else {
                console.log("entra al else");
                throw new Error("Producto no encontrado en el carrito");
            }
        } catch (error) {
            throw new Error("Error al eliminar producto del carrito");
        }
    }

    async clearCart(cid) {
        try {
            console.log("1");
            const carrito = await this.getCartById(cid);
            console.log("2- carrito: ", carrito);
            carrito.products = [];
            carrito.markModified("products");
            console.log("3- carrito: ", carrito);
            return await carrito.save();
        } catch (error) {
            throw new Error("Error al vaciar el carrito: ", error);
        }
    }

    async replaceProductsCart(cid, body) {
        try {
            console.log("en cartService - cid: ", cid);
            console.log("en cartService - body: ", body);
            await this.clearCart(cid);
            for (const product of body) {
                await this.addProductToCart(cid, product.product, product.quantity);
            }
            return await this.getCartById(cid);
        } catch (error) {
            console.error("Error al reemplazar productos del carrito ", error);
        }
    }

    async addProductToCart(cid, pid, quantity = 1) {
        try {
            console.log("en addProductToCart de cartRepository");
            const carrito = await this.getCartById(cid);
            console.log("carrito: ", carrito);
            const existeProd = carrito.products.find(item => item.product._id.toString() === pid);
            console.log("existeProd: ", existeProd);
            
            if (existeProd) {
                existeProd.quantity += quantity;
            } else {
                carrito.products.push({ product: pid, quantity });
            }

            carrito.markModified("products");
            return await this.updateCart(carrito);
        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }
}

module.exports = CartRepository;