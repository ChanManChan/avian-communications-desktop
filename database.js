const mongoose = require('mongoose')

class Database {

  constructor() {
    this.connect()
  }

  connect() {
    mongoose.connect("mongodb://Nandu:police@localhost:27017/Avian_Desktop")
    .then(() => console.log("database connection successful"))
    .catch(err => console.log("database connection error", err))
  }
}

module.exports = new Database()