# Put here your frontend for the Spanish Poker Dice Platform
Leave in this file any comments that you want us to read.

---

## How to run
### You will need
- Node.js installed
- MongoDB running locally on port 27017

### Frontend
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173


### Backend
```
cd backend/project
npm install
npm run dev
```
Runs on http://localhost:2222


### Seed the database
```
cd backend/project
npm run seed
```
Inserts 10 users, 10 matches and 3 tournaments.  
**Test login:**  
username: `alice`  
password: `pass123`


## Not implemented
- Tournament pages and trophies.
- Profile image upload.
- Last 10 games and stats on profile.

Note: `.env` files are included in the delivery for convenience. I understand it is not normal practice.