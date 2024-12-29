# Free Manga Site

## .env file in the backend
You need to create a dotenv file inside the backend folder with the content:
- NODE_ENV = development
- PORT = 3000
- JWT_SECRET = your_secret
- MONGO_URI = your_mongo_uri
- CLOUDINARY_NAME = your_cloudinary_name
- CLOUDINARY_KEY = your_cloudinary_key
- CLOUDINARY_SECRET = your_cloudinary_secret
- DEFAULT_COVER = your_default_manga_cover_image_http_link

## How to run this program
1. Install node modules in both the "**src**", "**src/backend**" and "**src/frontend**" folders with the command "npm i"
2. cd src, then type "npm run dev" to run
3. Go to [http://localhost:5000](http://localhost:5000)

## About admin accounts
To make an account an admin, use MongoDB Compass or similar tools to edit the role of the user to "admin" directly in the database.
