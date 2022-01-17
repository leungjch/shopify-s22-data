const dotenv = require('dotenv');

// Get env variables
dotenv.config();

module.exports = {
    S3_ACCESS_ID : process.env.S3_ACCESS_ID,
    S3_SECRET_ACCESS_KEY : process.env.S3_SECRET_KEY,
    MONGO_ADMIN_USER : process.env.MONGO_ADMIN_USER,
    MONGO_ADMIN_PASSWORD : process.env.MONGO_ADMIN_PASSWORD,
    MONGO_DBNAME : process.env.MONGO_DBNAME
};