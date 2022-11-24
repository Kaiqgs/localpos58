import configure from '@jimp/custom';
import plugins from '@jimp/plugins';
import dither from './src/jimplugin/dither';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import index from './src/routes/index';

configure(
    {
        plugins: [plugins, dither]
    }
)
dotenv.config();

// const port = process.env.PORT;
const app: Express = express();
app.use(cors());
app.use(express.json());
index(app);
app.listen(3000);
