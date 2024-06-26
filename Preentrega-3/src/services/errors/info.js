const generarInfoError = (product) => {
    console.log("Producto recibido para generar info de error:", product);
    
    return `Los datos estan incompletos o no son validos. 
    Necesitamos recibir los siguientes datos:
    - title: String, pero recibimos lo siguiente: ${product.title}
    - description: String, pero recibimos ${product.description}
    - price: Number, pero recibimos ${product.price}
    - code: String, pero recibimos ${product.code}
    - stock: Number, pero recibimos ${product.stock}
    - category: String, pero recibimos ${product.category}`;
};

module.exports = generarInfoError;
