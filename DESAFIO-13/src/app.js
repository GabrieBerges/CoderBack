const express = require("express");
const exphbs = require("express-handlebars");
const { engine } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport.config.js');
const configObject = require("./config/config.js");
const app = express();
const PUERTO = configObject.port;
require("./database.js");
const manejadorError = require("./middleware/error.js");
const {verifProduct} = require("./utils/util.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const usersRouter = require("./routes/users.router.js")
const viewsRouter = require("./routes/views.router.js")
const sessionsRouter = require("./routes/sessions.router.js");
const { addLogger } = require("./utils/config_logger.js");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(session({
    secret: configObject.session_secret,
    resave: true,
    saveUninitialized: false, 
    cookie: { maxAge: 24 * 60 * 60 * 1000}
}));

//Configuramos Express-Handlebars
app.engine('handlebars', engine({
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set("views", "./src/views");
app.use(addLogger);


// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/user", usersRouter)
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);

//ruta para testear winston:
app.get("/loggerTest", (req, res) => {
    req.logger.http("Mensaje HTTP"); 
    req.logger.info("Mensaje INFO"); 
    req.logger.warning("Mensaje WARNING"); 
    req.logger.error("Mensaje ERROR"); 
    req.logger.fatal("Mensaje FATAL");
    res.send("Logs generados");
})

//Cambios passport: 
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`)
})


//configuramos socket.io
const { Server } = require("socket.io");

const io = new Server(httpServer);


//para obtener el array de productos: 
// const ProductManager = require("./dao/controllers/ProductManager.js");
// const productManager = new ProductManager("./src/dao/models/products.json");
const MessageModel = require("./dao/models/messages.model.js")

const { ProductService } = require("./services/index.js")

//Instancia de Socket.io del lado del servidor. 
io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    socket.on("loadProducts", async (userData) => {
        let products;
        console.log("En loadProducts")
        console.log(userData)
        if (userData.role === "admin") {
            products = await ProductService.getProducts();
        } else if (userData.role === "premium") {
            products = await ProductService.getProductsByOwner(userData.email);
        }
        socket.emit("products", products);
    });

    // socket.emit("products", await ProductService.getProducts());

    socket.on("eliminarProducto", async (id) => {
        console.log("pasa por eliminar de app.py");
        console.log("id: ", id);
        await ProductService.deleteProduct(id);
        socket.emit("products", await ProductService.getProducts());
    })

    socket.on("agregarProducto", async (product) => {
        console.log("pasa por app.py");
        console.log("antes del verifEmpty");
        const success = verifProduct(product);
        console.log("después del verifEmpty");
        if (success) {
            console.log("product en app.js: ", product);
            const result = await ProductService.addProduct(product);
            console.log(result);
            socket.emit("products", await ProductService.getProducts());
        }
    })


    socket.on("message", async data => {
        await MessageModel.create(data);
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("messagesLogs", messages);
    })
})

// Siempre después de las rutas
app.use(manejadorError);
