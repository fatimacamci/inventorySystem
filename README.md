# Detachment 825 Inventory System

This is a React-based inventory tracking system with a user-facing page to view and search inventory records, and an admin portal for managing data. The backend has not been added yet — this repository currently contains the complete frontend setup (React + Vite + React Router).

---

## Tech Stack (Current)
- **React**
- **Vite** (development server and build tool)
- **React Router** (page navigation)
- **CSS** (custom styling)

Backend will be added later (likely Python + Flask / FastAPI).

---

## Requirements
# Frontend
Make sure you have:

- **Node.js `20.19+`**  
  Check your version:
  ```bash
  node -v

If your Node version is lower than 20.19, install the correct version (recommended using nvm):

nvm install 20.19.0
nvm use 20.19.0

1. Install dependencies
npm install

2. Start the dev server
npm run dev

3. Open the app in browser
http://localhost:5173

- **Admin Password: adminpassword**
Can be changed later but use the above password to access admin pages

# Backend
1. cd backend
2. python3 -m venv .venv 
source .venv/bin/activate
(mac)
OR 
python -m venv .venv 
.venv\Scripts\activate
(PC)
3. pip install -r requirements.txt
4. create .env file in backend with following content:
ADMIN_PASSWORD=adminpassword
ADMIN_JWT_SECRET=some-super-secret-random-string
FLASK_ENV=development
5. run project using
source .venv/bin/activate
python3 app.py
(mac)
OR
.venv\Scripts\activate
python app.py
(PC)


## Project Structure
Each page in the project has its own file under src/pages
There will be a protected route for the admin pages to avoid access by simply typing in the URL (ex: localhost:5173/admin)
