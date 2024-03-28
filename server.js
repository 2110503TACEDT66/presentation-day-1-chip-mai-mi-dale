const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const swaggerJsDoc=require('swagger-jsdoc');
const swaggerUI=require('swagger-ui-express');

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to database
connectDB();

//Route files
const coworkingSpaces = require('./routes/coworkingSpaces');
const reservations = require('./routes/reservations');
const rooms = require('./routes/rooms');
const auth = require('./routes/auth');

const app = express();

const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV,"on" + process.env.HOST + ':' + PORT));

const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info:{
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Co-working Sapces API'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//add Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attack
app.use(xss());

//Rate Limiting
const limiter=rateLimit({
    windowsMs: 10*60*1000, //10mins
    max: 100
});
app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

//Mount routers
app.use('/api/v1/coworkingSpaces', coworkingSpaces);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/rooms', rooms);
app.use('/api/v1/auth', auth);

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
})
