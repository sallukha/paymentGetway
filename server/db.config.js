const mongoose = require("mongoose")
const connectDB=async()=>{
     await mongoose.connect("mongodb://localhost:27017")
    console.log(`${mongoose.connection.host} is concect`)
}

module.exports=connectDB