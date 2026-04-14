# ChaiCode Cinema
- this is a system where ticket booking is simulated .
- it allows multiple users to book seats conflictlessly .
- using authentication, only verified users are allowed to book seats .

## Steps to setup the project 
 - either fork it or clone it locally in your computer.
 ( git clone https://github.com/Atishay-j-a-in/book-my-ticket.git)
 - set up .env using .env.example . Give values to all the variables including 
   - postgres host, username, password , db and port 
   - localhost port 
   - jwt secrets and expires in for refresh and access tokens .
- use npm install to install all the dependencies required for the project to work .
- then run -> npm run dev


voila you are ready to book tickets.

## End points 
- 'GET' / - register/login page
- 'GET' /theatre - seats in theatre ( protected route)
- 'GET' /seats - get all seats
- 'POST' /register
- 'POST' /login


below all routes are protected
- 'POST' /logout 
- 'POST' /refresh - refresh access and refresh token
- 'PUT' /:id/:name - book seats

## Flow

1. Server startup and DB bootstrap  
The app starts in server.js,ensures the Users and seats tables, and seeds 40 seats if they do not already exist.

2. Middleware pipeline  
Request parsing and cookies are enabled with Express + cookie parser, CORS is enabled, then auth and user routes are mounted in server.js.

3. Registration flow  
POST /register goes through DTO validation in auth.route.js and validate.middleware.js.  
If valid, controller logic in auth.controller.js checks existing email, hashes password with bcrypt from hash.utility.js, inserts user in PostgreSQL, and returns a success response.

4. Login flow  
POST /login validates input, checks credentials, then generates:
- Access token (short-lived)
- Refresh token (long-lived)  
JWT utilities are in jwt.utility.js.  
Refresh token is hashed (SHA-256) before saving in DB, while raw refresh token is set in an HTTP-only cookie in auth.controller.js.  
Access token is returned in response body for protected API calls.

5. Protected route authentication  
For protected endpoints, middleware in auth.middleware.js reads Bearer access token (or cookie fallback), verifies JWT, confirms user still exists, and attaches req.user.

6. Refresh token flow  
POST /refresh uses refresh-token middleware in auth.middleware.js:  
- Read refresh token from cookie  
- Hash and match with DB-stored token  
- Verify refresh JWT  
Then controller rotates tokens (new access + new refresh), updates hashed refresh token in DB, and resets refresh cookie.

7. Theatre and seat retrieval  
- GET / serves auth page  
- GET /theatre is protected and serves booking UI  
- GET /seats returns all seats  
Routes are defined in user.route.js.

8. Seat booking flow (conflict-safe)  
PUT /:id/:name is protected and uses a DB transaction in user.route.js:  
- BEGIN  
- SELECT ... FOR UPDATE on seat where isbooked = 0  
- If available, update seat as booked with owner and name  
- COMMIT on success, ROLLBACK on failure  
This row lock prevents two users from booking the same seat concurrently.

9. Logout flow  
POST /logout clears stored refresh token in DB and clears cookie in auth.controller.js.

10. Error handling  
Any thrown ApiError is caught by global error middleware in server.js, returning consistent JSON error responses using helpers in apierror.js and response.js.
