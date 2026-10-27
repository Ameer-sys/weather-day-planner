import { createServer } from './backend.mjs';
const port = Number(process.env.PORT || 3000);
createServer().listen(port, '127.0.0.1', () => console.log(`ATMOS ready at http://localhost:${port}`));
