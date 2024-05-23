const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://slandini:coderback@cluster0.dcr0wh1.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conexión exitosa!"))
    .catch((error) => console.log("Hubo un error en la conexión", error))
