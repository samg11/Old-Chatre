import { app } from './app';

const PORT = process.env.PORT || 8080;

// runs web server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});