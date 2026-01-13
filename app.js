import express from 'express';
import fs from "node:fs";
import path from 'node:path';
import routes from './routes/index.js';
import { fileURLToPath } from "node:url";
import methodOverride from 'method-override';

// Re-create __dirname in ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Essential for Datastar v1/v2
app.use(express.urlencoded({ extended: true }));    
app.use('/', routes);

export default app;

