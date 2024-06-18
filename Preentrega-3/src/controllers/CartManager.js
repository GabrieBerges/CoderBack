
const fs = require("fs").promises;
const CartModel = require("../models/cart.model.js");
const { CartService } = require("../services/index.js");

class CartManager {
  constructor() {
    this.carts = [];
    this.lastId = 0;
  }

  async newCarts() {
    try {
      return CartService.createCart();
    } catch (error) {
      console.error("Error al crear el carrito", error);
    }
  }

  async getCartById(cid) {
    try {
      return await CartService.getCartById(cid);
    } catch (error) {
      console.error("Error al obtener el carrito indicado ", error);
    }
  }

  // async addProductToCart(cid, pid, quantity = 1) {
  //   try {
  //     const carrito = await CartService.getCartById(cid);
  //     const existeProd = carrito.products.find(item => item.product.toString() === pid);

  //     if (existeProd) {
  //       existeProd.quantity += quantity;
  //     } else {
  //       carrito.products.push({ product: pid, quantity });
  //     }

  //     carrito.markModified("products");
  //     return await CartService.updateCart(carrito);
  //   } catch (error) {
  //     console.error("Error al agregar producto al carrito ", error);
  //   }
  // }

  async deleteProductCart(cid, pid) {
    return await CartService.deleteProductFromCart(cid,pid);
  }

  // async replaceProductsCart(cid, body) {
  //   try {
  //     await CartService.clearCart(cid);
  //     for (const product of body) {
  //       await this.addProductToCart(cid, product.product, product.quantity);
  //     }
  //     return await CartService.getCartById(cid);
  //   } catch (error) {
  //     console.error("Error al reemplazar productos del carrito ", error);
  //   }
  // }

  async updateProductCart(cid, pid, quantity = 1) {
    try {
      const carrito = await CartService.getCartById(cid);

      const existeProd = carrito.products.find(item => item.product._id.toString() === pid);

      if (existeProd) {
        existeProd.quantity = quantity;
      } else {
        console.log("No se encontró un producto con ese Id en el carrito");
        return;
      }

      carrito.markModified("products");
      return await CartService.updateCart(carrito);
    } catch (error) {
      console.error("Error al actualizar producto del carrito ", error);
    }
  }

  // Métodos para manejar lo que saqué del router
  async handleNewCarts(req, res) {
    try {
      const newCart = await this.newCarts();
      res.status(201).json(newCart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleGetCartById(req, res) {
    const cId = req.params.cid;
    const email = req.query.email
    try {
      let cart = await CartService.getCartById(cId);
      const products = cart.products.map(item => ({
        product: item.product.toObject(),
        quantity: item.quantity
      }));
      console.log("products antes de cart.handl: ", products);
      console.log("email: ", email);
      res.render("cart", { cId, email, products });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleAddProductToCart(req, res) {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = parseInt(req.body.quantity) || 1;
    try {
      const cartActualized = await CartService.addProductToCart(cid, pid, quantity);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleDeleteProductCart(req, res) {
    const cid = req.params.cid;
    const pid = req.params.pid;
    try {
      const cartActualized = await this.deleteProductCart(cid, pid);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleReplaceProductsCart(req, res) {
    const cid = req.params.cid;
    const body = req.body;
    try {
      const cartActualized = await CartService.replaceProductsCart(cid, body);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleUpdateProductCart(req, res) {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = req.body.quantity;
    try {
      const cartActualized = await this.updateProductCart(cid, pid, quantity);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleClearCart(req, res) {
    const cid = req.params.cid;
    try {
      const cartActualized = await CartService.clearCart(cid);
      res.status(201).json(cartActualized.products);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = CartManager;