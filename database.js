const mongoose = require("mongoose");

class DataBase {
    constructor() {
        this.connect();
    }
    connect() {
        mongoose
            .connect(
                "mongodb+srv://admin:admin@twitterclonecluster.pxmoj.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority"
            )
            .then(() => {
                console.log("DB connection successfull");
            })
            .catch((error) => {
                console.log("Error in connecting to DB ->", error);
            });
    }

    disconnect() {
    }
}

module.exports = new DataBase();