# Put here your backend for the Spanish Poker Dice Platform

The backend should largely be a copy from Oblig 2. If something is changed, mention it here.

Leave in this file any comments that you want us to read.

## Changes to backend
- Add /api prefix to base path of endpoints in index.js.
- Change user service to accept username instead of email for login in user-services.js.
- Add "match" rule to the email field in the user model to check for proper email format in User.js.
- Add status and allowAnonymous fields to the Match schema in Match.js, to filter joinable games in homepage and in the lobby.
- Add .populate on playerOne and playerTwo in match-services.js, so matches return username and elo instead of just user id, to show in lobby preview and page.
- Add so status field changes are saved to a match when updating it in match-services.js.
- Match date is automatically set in match-services.js when a match is marked as finished.
- Change timeControl values to 3,10,30 in Match.js to match oblig 3 requirements.
- Update seed data with 10 users and 10 matches with all new fields and and wire players to matches on running seed script in db-seed.js, users.json and matches.json.
- Add populate on author in comment-services.js so comments include the author username and not just their id.
- Add playerTwo to updateMatch in match-services.js so joining a game saves the second player.
- Add aboutMe field to User.js and handle it in user-services.js so users can write and save a short description on their profile.
- Add aboutMe field to the respones of getUser in the user-controller.js so profile page can display it.
- Add appearance field to User.js, handle it in user-services.js and include it in getUser response in user-controllers.js so appearance customizer settings can be saved and loaded per user.
