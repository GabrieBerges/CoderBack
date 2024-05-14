const fs = require('fs').promises;
const ProductModel = require("../models/product.model.js");

class ProductManager {
  constructor(path) {
    this.path = path;
    this.idCounter = 0;
  }

  async addProduct({title, description, price, img, code, stock, category, thumbnails}) {
    
    try {
      if (!title || !description || !price || !code || !stock || !category) {
        console.log("No todos los campos contienen un valor");
        return;
      }

      if(await ProductModel.findOne({code: code})) {
        console.log("El código ya existe");
        return;
      }

      const nuevoProducto = new ProductModel({
        title,
        description,
        price,
        img, 
        code, 
        stock,
        status: true, 
        category, 
        thumbnails: thumbnails || []
      });

      return await nuevoProducto.save();

    } catch (error) {
      console.log("Error al agregar el nuevo producto", error);
    }
  }

  async getProducts() {
    
    try {
      return await ProductModel.find().lean();
    } catch (error) {
      console.log("Error al recuperar los productos", error);
    }
  }

  async getProductById(id) {
    
    try {
      return await ProductModel.findById(id).lean();
    } catch (error) {
      console.log("Error al recuperar el producto indicado", error);
    }
  }

  async updateProduct(id, updatedProduct) {
    
    try {
      return await ProductModel.findByIdAndUpdate(id, updatedProduct);
    } catch (error) {
      console.log("Producto no encontrado", error);
    }
  }

  async deleteProduct(id) {
    
    try {
      return await ProductModel.findByIdAndDelete(id)
    } catch (error) {
      console.log("Producto no encontrado");
    }
  }

  async getProductsFromFile() {
    try {
      const data = await fs.readFile(this.path, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveProductsToFile(products) {
    try {
      await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error("Error escribiendo el archivo:", error);
    }
  }

  async get_new_id() {
    let products = await this.getProductsFromFile();

    if (products.length > 0) {
        this.idCounter = products[products.length - 1].id;
    } else 
    
    console.log("ultId: " + this.idCounter);
    
    return (parseInt(this.idCounter) + 1);
  }
}

module.exports = ProductManager;
