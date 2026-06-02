# How to launch this project
## Prerequisites
* `Node.js` installed.
* `MongoDB` running locally.

## 1. Install dependencies
```bash
# First open the terminal
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## 2. Set up environment variables

The backend requires a .env.dev file. It is included in this .zip for convenience so the project works out of the box. In a real scenario we would not expose secrets this way, instead we would provide a .env.example with blank values and share the actual secrets through a secure channel.

## 3. Seed the database 

```bash
cd backend
npm run seed
```
This populates the db with mock data. Login credentials you can test:
* **Admin** admin@pokerdados.com / Admin123! 
* **Regular user:** blitzKrieg@test.com / Blitz4ever!

## 4. Run the application 
Open two terminal windows. One for backend and one for frontend.
**Terminal 1 Backend:**
```bash
cd backend
npm run dev
```
**Terminal 2 Frontend:**
```bash
cd frontend
npm run dev
```
**Backend API available at:** http://localhost:3000/api  
**Frontend available at:** http://localhost:5173