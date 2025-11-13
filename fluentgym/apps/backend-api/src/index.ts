import { config } from 'dotenv';
import { buildApp } from './app';

config();

const app = await buildApp();

const port = Number(process.env.PORT || 3001);
app.listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`Backend running on http://localhost:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
