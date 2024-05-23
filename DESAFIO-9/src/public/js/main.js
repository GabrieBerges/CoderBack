//ESTE ES EL LADO CLIENTE

const socket = io();


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
                        <p> Id: ${prod.id} </p>
                        <p> Título: ${prod.title} </p>
                        <p> Precio: ${prod.price} </p>
                        <button> Eliminar </button>  
                        `;
        contenedorProductos.appendChild(card);

        //agregamos el evento al botón de eliminar
        card.querySelector("button").addEventListener("click", () => {
            eliminarProducto(prod.id);
        })
    })
}

const eliminarProducto = (id) => {
    console.log("eliminando");
    socket.emit("eliminarProducto", id);
}

document.getElementById("btnEnviar").addEventListener("click", () => {
    agregarProducto();
})

const agregarProducto = () => {
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        status: document.getElementById("status").value === "true"
    }
    socket.emit("agregarProducto", product);
}