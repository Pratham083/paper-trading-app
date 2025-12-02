# Full Stack Paper Trading App
This app is designed to allow users to simulate trading stocks with fake money. You can also use it to view analytics of stocks. There is also a leaderboard where you can view the users with the most money and view their portfolios. It is deployed on this link: [https://paper-trading-frontend-z8xl.onrender.com/](https://paper-trading-frontend-z8xl.onrender.com/)

## Demo video
Watch my demo here: [https://youtu.be/r5PAdysW9wM](https://youtu.be/r5PAdysW9wM)

## Setup (Run locally on your machine)

Ensure you have docker installed on your machine.
1. Download the repo as a zip file and extract
2. Open the terminal, cd into the paper-trading-app folder
3. In the terminal run: docker-compose up --build
4. When the build completes, open Chrome/Edge to https://localhost
  - It may take a few minutes to get ready
  - Firefox gave me trouble personally, I think because of the self-signed certs. It gave a 502 gateway error. But Chrome/Edge should work.


## Endpoints

### Health

**GET /health**  
Returns `{ "status": "ok" }`.

### Auth Routes (`/auth`)

#### POST /auth/register  
Create a new user.  
Body: `{ username, email, password }`  
Responses:  
- 201 – user created  
- 400 – validation error  
- 409 – username/email already exists  

#### POST /auth/login  
Log in using username **or** email. Sets access + refresh cookies.  
Body: `{ identifier, password }`  
Responses:  
- 200 – success  
- 400 – validation error  
- 401 – bad credentials  

#### POST /auth/refresh  
Refresh access token using refresh cookie.

#### POST /auth/logout  
Clears JWT cookies.

#### GET /auth/check  
Checks if the user is authenticated.  
Returns `{ authenticated: true/false }`.

#### DELETE /auth/account/delete  
Deletes the authenticated user.  
Responses:  
- 200 – deleted  
- 404 – user not found  

#### PUT /auth/account/update  
Update username, email, or password.  
Body: `{ username, email, new_password, current_password }`  
Responses:  
- 200 – updated  
- 400 – validation error  
- 401 – incorrect password  
- 409 – username/email taken  

### Trading Routes (`/api`)

#### GET /api/portfolio  
Returns the user’s portfolio including updated holdings.

#### POST /api/holding/buy  
Buy a stock.  
Body: `{ stock_id, quantity }`  
Responses:  
- 200 – success  
- 400 – invalid quantity / insufficient funds  
- 404 – stock or portfolio not found  
- 503 – price unavailable  

#### GET /api/holding/stock/<stock_id>  
Get holding by stock ID.  
Responses:  
- 200 – success  
- 404 – not found  

#### POST /api/holding/sell  
Sell a stock.  
Body: `{ stock_id, quantity }`  
Responses:  
- 200 – success  
- 400 – not enough shares / invalid quantity  
- 404 – stock or portfolio not found  
- 503 – price unavailable  

### Stock Routes

#### GET /api/stock/all  
Returns `{ id, symbol, company }` for all stocks.

#### GET /api/stock/details/<symbol>  
Returns full stock details.  
Responses:  
- 200 – success  
- 404 – not found  

#### GET /api/stock/historical/<symbol>?period=<period>  
Returns historical price data.  
Responses:  
- 200 – success  
- 404 – symbol not found  
- 503 – data unavailable  

### Leaderboard

#### GET /api/leaderboard?page=&size=  
Returns ranked users by total portfolio value.  
Includes authenticated user’s rank if available.  
Response fields: `page, size, total_pages, total_users, top_users, my_rank`

## Architechtural Design & Tech Stack
This app follows a monolithic architecture (one backend service/codebase).

### Frontend
React and TailwindCSS

### Backend
Flask + some helper libraries:
- **SQLAlchemy** models for database tables
- **Marshmallow** for validation and serialization
- **flask-jwt-extended** for authentication
- **Werkzeug security** for password hashing
- **yfinance** to fetch stock data (external API)

### Database
- **PostgreSQL** for DEV and PROD
- **SQLite (in-memory)** for unit tests

### Infrastructure
Containerized using Docker:
- One container for the Flask backend
- One for the React build (final static files served by NGINX)
- One for the PostgreSQL database
- NGINX enables HTTPS, routes traffic and serves frontend assets


## Auth & Security
JWTs are used for authentication. Both access tokens and refresh tokens are used and stored in cookies for security (prevent XSS attacks).

## Testing & QA
Both unit tests and end-to-end tests were implemented. Pytest was used for unit tests and SeleniumBase was used for end-to-end.

## Deployment
To deploy this app, I had to make some modifications to the docker setup, which currently worked on localhost. I deployed it on a service called **Render**, free to use.

I put the deployment code in the render-deploy branch. The docker setup on render-deploy differs slightly from the main branch, as the main branch code is intended to work locally.

You can access it at this link: [https://paper-trading-frontend-z8xl.onrender.com/](https://paper-trading-frontend-z8xl.onrender.com/)