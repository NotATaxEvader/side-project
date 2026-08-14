# Altitude Flight Booking

Vue/Vite frontend with an Express and MongoDB backend.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   cd server && npm install
   ```

2. Start the API from `server/`:

   ```bash
   npm run dev
   ```

3. Start the frontend from the project root in another terminal:

   ```bash
   npm run dev
   ```

The frontend defaults to `http://localhost:5173` and the API to `http://localhost:4000`.

## Verification

```bash
cd server
npm run check
npm test

cd ..
npm run build
```
