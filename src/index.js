import express from 'express';
import serverConfig from './configs/server.json';
import responseCodes from './configs/httpCodes.json';

const httpHeaders = require('./middleware/http-headers.js');
const authorization = require('./middleware/ip-restriction.js'); // this can be changed to ./middleware/auth-token.js if this API will be public
const app = express();

console.log('starting app...');

// initializing  middlewares
app.use(httpHeaders);	// allow POST, GET requests
app.use(authorization); // checking if request is authorized

// routing
app.use(require('./routing/dispatcher.js'));

// sending error if no routing found
app.get('*', (req, res) => {
	res.status(responseCodes.FAIL).send('');
});

app.listen(serverConfig.port, serverConfig.ip);