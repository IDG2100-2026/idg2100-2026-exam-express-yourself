# Changes i did on Oblig 2 


## Routes
1. created a route with /login, that we will use now in login frontend! 




## Controllers
1. Forgot to add a try catch block inside createUser in userController. response.json failed because of that. 
2. Forgot to create a login controller
3. I created a login controller that gets the email and password from request body, and we put that into loginUser arguments so the services can check the database. If we find a user, we give a 200 status code, but if we don’t find a user, we return a 404 status code. 
4. In controller we get the gameId, and userId, and pass that to the service. We need userId to check if the player is anonymous or not, because anonymous players is not supposed to see registered users games.
5. Changed how we check for userID in joinAGame controller for games. Instead of having const userId = req.user.id; we have const userId = req.headers[‘user-id’] || null, because if there is no header with user id, then the user is anonymous, and the user should be able to join anonymous games. 



## Services
1. Added `.populate("players.userId", "username eloRating")` to be able to display username, and elo rating when fetching all games
2. added `.populate("comments")` so wo could display the comments that was on a single game
3. Removed the hashing on password for userServices, because we already did that in the pre save on the schema
4. Forgot to create a login service





## Validator    
1. I created a login validator that checks email and password and that those are required! 




## Other
1. Forgot to add seed into package.json to seed the database with dummy info
2. Added cors into server.js.
3. we get the gameId from finding a game with findOne, and we first check for errors (if the game exists, if the game has already started, if the player is already in that game, and if the game is full. If everything goes trough, we push the player into the game, changes status and saves it to the database. 
4. fixed my rate limiter so that we are not capped to one comment per 5 minute, now we have so that we can post 5 comments in 5 seconds, and if user tries to span over that, they get an error message!
