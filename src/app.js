const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const routes = require('./routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.http.corsOrigin }));
app.use(express.json({ limit: config.http.jsonBodyLimit }));
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
