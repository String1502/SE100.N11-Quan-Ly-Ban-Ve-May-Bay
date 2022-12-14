const express = require('express');
import bodyParser from 'body-parser';
import configViewEngine from './config/viewEngine';
import initWebRoutes from './routes/index';
import connectDB from './config/connectDB';
import updateData from './controllers/DataController';
const methodOverride = require('method-override');

var cookieParser = require('cookie-parser');

require('dotenv').config();
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('quanlyvemaybay'));
configViewEngine(app);

initWebRoutes(app);

//static file
app.use(express.static(path.join(__dirname, 'public')));

app.use(methodOverride('_method'));

connectDB();
//update TrangThaiChuyenBay + DoanhThu
updateData;

//Bthuong thi nó chạy ở port 8080, lỗi thì qua 8081
const port = process.env.PORT || 8081;
app.listen(port, () => {
    console.log('Server chay o port: ' + port);
});
