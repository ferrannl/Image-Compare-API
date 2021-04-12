module.exports = {
    port: process.env.PORT || 5000,
    secret: process.env.PASSWORD_KEY || '%34534ttv435^%645#@%6*67',
    mongo_address: process.env.MONGO_ADDRESS || 'localhost',
    mongo_port: process.env.MONGO_PORT || 27017,
    mongo_database: process.env.MONGO_DATABASE || 'webs5_end',
    mongo_user: process.env.MONGO_USER || 'root',
    mongo_password: process.env.MONGO_PASSWORD || '',
    mongo_connection_string: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/webs5_end',
    host: process.env.HOST || 'http://localhost:5000'
}
