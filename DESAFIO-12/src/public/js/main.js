//ESTE ES EL LADO CLIENTE

const socket = io();
const { logger } = require('../../utils/config_logger.js');

// // el evento "mensaje" se debe respetar en el socket.on en app.js (el lado del servidor)
// socket.emit("mensaje", "Hola mundo, te escribo desde el cliente");


// // recibimos el producto
socket.on("products", (data) => {
    renderProductos(data);
})


//función para renderizar la lista de prods
const renderProductos = (products) => {
    const contenedorProductos = document.getElementById("contenedorProductos");
    contenedorProductos.innerHTML = "";

    products.forEach(prod => {
        const card = document.createElement("div");
        card.innerHTML = `
                        <p> Código: ${prod.code} </p>
                        <p> Título: ${prod.title} </p>
                        <p> Precio: ${prod.price} </p>
                        <button> Eliminar </button>  
                        `;
        contenedorProductos.appendChild(card);

        //agregamos el evento al botón de eliminar
        card.querySelector("button").addEventListener("click", () => {
            eliminarProducto(prod._id);
        })
    })
}

const eliminarProducto = (id) => {
    logger.info("eliminando");
    socket.emit("eliminarProducto", id);
}

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})

const agregarProducto = () => {
    logger.info("dentro de agregarProducto en main.js");
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        code: document.getElementById("code").value,
        stock: Number(document.getElementById("stock").value),
        status: document.getElementById("status").value === "true",
        category: document.getElementById("category").value,
        thumbnail: document.getElementById("thumbnail").value
    }
    logger.info(`product en main.js: ${JSON.stringify(product, null, 2)}`)
    socket.emit("agregarProducto", product);
}