const manejadorError = require("../middleware/error.js");
const CustomError = require("../services/errors/custom-error.js");
const EErrors = require("../services/errors/enum.js");
const generarInfoError = require("../services/errors/info.js");
const {faker} = require("@faker-js/faker");

const verifProduct = (productData) => {
    console.log(productData);

    try {
        if (!productData['title'] || !productData['description'] || !productData['code'] || !productData['category']) {
            console.log("entró en vacío");
            
            throw CustomError.crearError({
                nombre: "Producto nuevo con algún valor vacío",
                causa: generarInfoError(productData),
                mensaje: "Error al intentar crear un producto",
                codigo: EErrors.VALOR_VACIO
            })
        }
        
        if (!typeof productData['price'] == "number" || !typeof productData['stock'] == "number") {
            console.log("no son números");
            
            try {
                productData['price']  = Number(productData['price']);
                productData['stock'] = Number(productData['stock']);
                
            } catch (error) {
                console.log("no se pudo: ", error);
                throw CustomError.crearError({
                    nombre: "Producto nuevo con precio/stock incorrecto/s",
                    causa: generarInfoError(productData),
                    mensaje: "Error al intentar crear un producto",
                    codigo: EErrors.TIPO_INVALIDO
                })
            }
        }
        
        if ( productData['price'] <=0 || productData['stock'] <=0) {
            throw CustomError.crearError({
                nombre: "Producto nuevo con precio/stock incorrecto/s",
                causa: generarInfoError(productData),
                mensaje: "Error al intentar crear un producto",
                codigo: EErrors.TIPO_INVALIDO
            })
        }
        
        return true;
    } catch (error) {
        console.log(error);
    }
}

const mockingProducts = () => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        code: faker.string.uuid(),
        stock: parseInt(faker.string.numeric()),
        status: faker.datatype.boolean(),
        category: faker.commerce.department(),
        thumbnail: faker.image.avatar()
    }
}

module.exports = { verifProduct, mockingProducts };