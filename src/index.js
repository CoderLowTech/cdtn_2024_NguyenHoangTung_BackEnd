import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './route/web';
import connectDb from './config/connectDb';
import cors from 'cors'
require('dotenv').config();

let app = express();
app.use(cors({ credentials: true, origin: true }));

//config app
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDb();

let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Project is running on port: ' + port);
});