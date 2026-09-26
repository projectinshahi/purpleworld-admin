# purple-admin

Admin panel for Purpleworld Tours: log in, follow up website enquiries, and manage packages
and Featured Destinations cards. React + Vite + Tailwind; talks to `purple-backend`.

## Setup

1. Start `purple-backend` first (see its README) and run its seed to create the admin account.
2. `npm install`
3. Copy `.env.example` to `.env`:
   - `VITE_API_URL`: backend URL (default http://localhost:4000)
   - `VITE_WEBSITE_URL`: public website, used by each package's "View on website" button
4. `npm run dev`: http://localhost:5173

`npm run build` outputs a static site in `dist/`. Host it anywhere, and configure the host to
serve `index.html` for all paths (single-page app).

## What changes where

| Admin section | Shows up on the website |
| --- | --- |
| Enquiries | Receives the home page “Start Your Journey” form |
| Packages (published) | `/packages`, `/packages/<slug>`, and the Kerala page for destination "Kerala" |
| Destinations | Home page → Featured Destinations |
| Images (uploaded from the image picker in package and destination forms) | Wherever they're chosen as a cover, gallery or destination image |

The website refreshes its data every 30 seconds, so changes can take up to half a minute to appear.
"# purpleworld-admin" 
