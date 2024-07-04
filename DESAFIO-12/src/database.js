const mongoose = require("mongoose");
const configObject = require("./config/config.js");

mongoose.connect(configObject.mongo_url)
    .then(() => console.log("Conexión exitosa!"))
    .catch((error) => console.log("Hubo un error en la conexión", error))
