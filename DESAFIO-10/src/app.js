const express = require("express");
const exphbs = require("express-handlebars");
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport.config.js');
const configObject = require("./config/config.js");
const app = express();
const PUERTO = configObject.port;
require("./database.js");

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const usersRouter = require("./routes/users.router.js")
const viewsRouter = require("./routes/views.router.js")
const sessionsRouter = require("./routes/sessions.router.js");

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("./src/public"));
app.use(session({
    secret: configObject.session_secret,
    resave: true,
    saveUninitialized: false
}));

//Configuramos Express-Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

app.use("/api", productsRouter);
app.use("/api", cartsRouter);
app.use("/user", usersRouter)
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);

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
const ProductManager = require("./controllers/ProductManager.js");
const productManager = new ProductManager("./src/models/products.json");
const MessageModel = require("./models/messages.model.js")

//Instancia de Socket.io del lado del servidor. 
io.on("connection", async (socket) => {
    console.log("Un cliente se conecto");
    
    socket.emit("products", await productManager.getProducts());
    
    socket.on("eliminarProducto", async (id) => {
        await productManager.deleteProduct(id);
        socket.emit("products", await productManager.getProducts());
        })

    socket.on("agregarProducto", async (product) => {
        await productManager.addProduct(product);
        socket.emit("products", await productManager.getProducts());
        })
    
    
    socket.on("message", async data => {
        
        await MessageModel.create(data);

        
        const messages = await MessageModel.find();
        console.log(messages);
        io.sockets.emit("messagesLogs", messages);
    })
})


