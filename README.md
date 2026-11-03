# CineVault

Film catalog and review web app. React + Vite frontend, Node.js + Express backend, MongoDB database.

**Current stage:** login page. Users can register, sign in with their username and password, and reach a placeholder home page. The film catalog, reviews and watchlist are added in later stages.

## Requirements

- Node.js 20.19 or newer (22 LTS recommended)
- MongoDB running locally on port 27017. If you use Docker, this starts one:

  ```bash
  docker run -d --name cinevault-mongo -p 27017:27017 mongo:7
  ```

## Run it

Open two terminals from the project root.

**1. Backend**

```bash
cd server
cp .env.example .env      # then set JWT_SECRET to a long random string
npm install
npm run dev               # http://localhost:5000
```

**2. Frontend**

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173. The root address redirects to the login page. Choose **Create an account**, register, then sign in with the same username and password.

## Folder structure

```
cinevault/
├── client/                      React + Vite frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   └── videos/              background.mp4, background.webm, poster.jpg
│   ├── src/
│   │   ├── api/                 fetch wrapper and auth API calls
│   │   ├── components/          AuthLayout, VideoBackground, TextField, route guards
│   │   ├── context/             AuthContext (current user, login, logout)
│   │   ├── pages/               LoginPage, RegisterPage, HomePage, NotFoundPage
│   │   ├── utils/               form validation
│   │   ├── App.jsx              routes
│   │   ├── main.jsx             entry point
│   │   └── index.css            design tokens and base styles
│   ├── index.html
│   ├── vite.config.js           dev server + /api proxy to the backend
│   └── package.json
├── server/                      Express backend
│   ├── src/
│   │   ├── config/              env.js (settings), db.js (MongoDB connection)
│   │   ├── controllers/         request handlers
│   │   ├── middleware/          auth guard, error handling
│   │   ├── models/              Mongoose models (User)
│   │   ├── routes/              route definitions
│   │   ├── utils/               token and cookie helpers
│   │   ├── validators/          request validation
│   │   ├── app.js               Express app setup
│   │   └── server.js            starts DB connection and HTTP server
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

New features follow the same pattern: a model in `models/`, handlers in `controllers/`, and a file in `routes/` that `app.js` mounts under `/api`.

## API

| Method | Endpoint             | Purpose                                       |
| ------ | -------------------- | --------------------------------------------- |
| GET    | `/api/health`        | Health check                                  |
| POST   | `/api/auth/register` | Create an account (username, email, password) |
| POST   | `/api/auth/login`    | Sign in (username, password)                  |
| POST   | `/api/auth/logout`   | Sign out                                      |
| GET    | `/api/auth/me`       | Current user (requires a session)             |

Passwords are hashed with bcrypt. The session is a JWT stored in an httpOnly cookie, so page scripts cannot read it.

## Background video

`client/public/videos/` holds a generated placeholder loop. To use your own footage, replace `background.mp4` (H.264) and `poster.jpg`, keeping the same file names. `background.webm` is a fallback for browsers without H.264; replace it too, or delete it and its `<source>` line in `client/src/components/VideoBackground.jsx`. Short, dark, muted loops under about 5 MB work best. The login window darkens the video, so most footage stays readable.

## Notes for later stages

- `COOKIE_SECURE` must stay `false` while the app is served over plain HTTP (for example on a lab machine) and can be set to `true` once HTTPS is in place.
- Under Docker Compose, set `MONGODB_URI` to the database service name and `VITE_PROXY_TARGET` to the backend service URL.
- The `/api/health` endpoint is ready for container health checks and the Jenkins pipeline.
