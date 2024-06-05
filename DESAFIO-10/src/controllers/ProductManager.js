const fs = require('fs').promises;
const { ProductService } = require("../services/index.js");

class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async addProduct({title, description, price, img, code, stock, category, thumbnails}) {
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        console.log("No todos los campos contienen un valor");
        return;
      }

      if(await ProductService.getProductByCode(code)) {
        console.log("El código ya existe");
        return;
      }

      const productData = {
        title,
        description,
        price,
        img, 
        code, 
        stock,
        status: true, 
        category, 
        thumbnails: thumbnails || []
      };

      return await ProductService.addProduct(productData);
    } catch (error) {
      console.log("Error al agregar el nuevo producto", error);
    }
  }

  async getProducts() { 
    try {
      return await ProductService.getProducts();
    } catch (error) {
      console.log("Error al recuperar los productos", error);
    }
  }

  async getProductById(id) {
    try {
      return await ProductService.getProductById(id);
    } catch (error) {
      console.log("Error al recuperar el producto indicado", error);
    }
  }

  async updateProduct(id, updatedProduct) {
    try {
      return await ProductService.updateProduct(id, updatedProduct);
    } catch (error) {
      console.log("Producto no encontrado", error);
    }
  }

  async deleteProduct(id) {
    try {
      return await ProductService.deleteProduct(id);
    } catch (error) {
      console.log("Producto no encontrado", error);
    }
  }

  async getPaginatedProducts(page, limit, user) {
    try {
      const products = await ProductService.getPaginatedProducts(page, limit);
      const productsResultadoFinal = products.docs.map(product => {
        const { _id, ...rest } = product.toObject();
        return rest;
      });

      return {
        products: productsResultadoFinal,
        pagination: {
          totalPages: products.totalPages,
          prevPage: products.prevPage,
          nextPage: products.nextPage,
          page: products.page,
          hasPrevPage: products.hasPrevPage,
          hasNextPage: products.hasNextPage,
          prevLink: products.prevLink,
          nextLink: products.nextLink,
          limit: limit
        },
        user: {
          email: user.email || 'mailpordefecto@algo.com',
          role: user.role || 'usuario'
        }
      };
    } catch (error) {
      console.log("Error al paginar los productos", error);
    }
  }

  async handleGetProducts(req, res) {
    const limit = parseInt(req.query.limit);
    try {
      let products = await this.getProducts();
      if (Number.isInteger(limit) && limit > 0) {
        products = products.slice(0, limit);
      }
      const payload = products;
      res.render("home", { payload });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleGetProductById(req, res) {
    const pid = req.params.pid;
    console.log("product_id: " + pid);
    try {
      const product = await this.getProductById(pid);
      console.log("product:");
      console.log(product);
      if (product) {
        res.send({ product });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleAddProduct(req, res) {
    const newProduct = req.body;
    try {
      const product = await this.addProduct(newProduct);
      if (product) {
        res.status(201).json({ message: "El producto fue agregado correctamente!" });
      } else {
        res.send("Producto no creado");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleUpdateProduct(req, res) {
    const pid = req.params.pid;
    const prodActualized = req.body;
    try {
      const product = await this.updateProduct(pid, prodActualized);
      if (product) {
        res.json({ message: "El producto fue modificado correctamente!" });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  async handleDeleteProduct(req, res) {
    const pid = req.params.pid;
    try {
      const product = await this.deleteProduct(pid);
      if (product) {
        res.json({ message: "El producto fue eliminado correctamente!" });
      } else {
        res.send("Producto no encontrado");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}

module.exports = ProductManager;
