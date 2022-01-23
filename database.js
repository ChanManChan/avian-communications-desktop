const mongoose = require('mongoose')

class Database {

  constructor() {
    this.connect()
  }

  connect() {
    mongoose.connect(process.env.DB_URI)
    .then(() => console.log("database connection successful"))
    .catch(err => console.log("database connection error", err))
  }
}

module.exports = new Database()