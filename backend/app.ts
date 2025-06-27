import express, { type Express } from 'express';
import { initializeApp } from './routes';

const app: Express = express();

initializeApp(app);