const fs = require("fs").promises;
const CartModel = require("../models/cart.model.js");

class CartManager {

    constructor() {
        this.carts = [];
        this.lastId = 0;
    }

    async newCarts() {

        try {
            const carritoNuevo = new CartModel({products:[]});

            await carritoNuevo.save();
            return carritoNuevo;

        } catch (error) {
            console.error("Error al crear el carrito", error);
        }
    }

    async getCartById(cid) {
        try {
            return await CartModel.findById(cid);
        } catch (error) {
            console.error("Error al obtener el carrito indicado ", error);
        }
    }

    async addProductToCart(cid, pid, quantity = 1) {
        
        try {
            const carrito = await this.getCartById(cid);
            console.log(carrito);
            const existeProd = carrito.products.find(item => item.product.toString() === pid);

            if (existeProd) {
                existeProd.quantity += quantity;
            } else {
                carrito.products.push({product:pid, quantity});
            }
 
            carrito.markModified("products");
            return await carrito.save();

        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }

    async deleteProductCart(cid, pid) {
        
        try {
            const carrito = await this.getCartById(cid);
            console.log(carrito);
            const existeProdIndex = carrito.products.findIndex(item => item.product.toString() === pid);

            if (existeProdIndex != -1) {
                
                carrito.products.splice(existeProdIndex, 1);
                console.log(carrito.products);
            } else {
                console.log("No se encontró un producto con ese Id en el carrito");
                return; 
            }

            carrito.markModified("products");
            return await carrito.save();

        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }

    async replaceProductsCart(cid, body) {
        
        try {
            await this.clearCart(cid);

            body.forEach(async (product) => await this.addProductToCart(cid, product.product, product.quantity));

            return await this.getCartById(cid);

        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }

    async clearCart(cid) {
        
        try {
            const carrito = await this.getCartById(cid);

            carrito.products = [];           
 
            carrito.markModified("products");
            return await carrito.save();

        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }

    async updateProductCart(cid, pid, quantity = 1) {
        
        try {
            const carrito = await this.getCartById(cid);
            console.log(carrito);
            const existeProd = carrito.products.find(item => item.product.toString() === pid);

            if (existeProd) {
                existeProd.quantity = quantity;
            } else {
                console.log("No se encontró un producto con ese Id en el carrito");
                return; 
            }
 
            carrito.markModified("products");
            return await carrito.save();

        } catch (error) {
            console.error("Error al agregar producto al carrito ", error);
        }
    }


}

module.exports = CartManager;