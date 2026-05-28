# Key Features
- Account System: Registration and authorization using JWT tokens. Secure password hashing with bcrypt.
- Personalized Galleries: Each user has access exclusively to their own uploaded images.
- Storage Quotas: Automatic tracking of used space. Storage is limited to 500 MB per user.
- File Storage: Utilizes MongoDB GridFS for streaming media files directly into the database, keeping the local disk clean.
- Real-time Interaction: Synchronization of UI elements like the image slider between connected clients using Socket.io.
- User Interface: Responsive React interface with support for protected routes and a dark and light theme toggle.

## Tech Stack for Backend

- Node.js and Express for the server environment.
- TypeScript for typing and object-oriented architecture using custom decorators.
- MongoDB and Mongoose for the database and object data modeling.
- GridFS for storing large binary files.
- Socket.io for websockets.
- JWT and Bcrypt for security and authorization.
- Multer for handling multipart form data.

## How to Run
### Prerequisites include having Node.js installed and a local MongoDB server running on port 27017.
```bash
docker run -d -p 27017:27017 --name my-mongodb mongo:latest
```
### Start the Server
```bash
cd Backend
cp .env.example .env #set JWT_SECRET to your secret if needed
npm install
npm run build
npm start
http://localhost:3000
```
### Tests
The project features a robust testing architecture that ensures reliability and separates business logic from database interactions:

Unit Tests: Isolated testing of individual services (e.g., AuthService, FileService) using Jest mocks. This ensures business logic is correct without the overhead of database connections.

E2E / Integration Tests: Comprehensive testing of API endpoints using Supertest and mongodb-memory-server. This simulates real HTTP requests and database interactions using an in-memory database, completely safely and without affecting production data.
```bash
npm test -- auth.e2e.test.ts
npm test -- AuthService.test.ts
```
### Project structure
- The project is divided into two independent parts that communicate via a REST API. The backend folder contains the MVC architecture of controllers, services, Mongoose models, and GridFS logic. The frontend folder contains React components, the Context API for managing authorization state, and services for API access.
### React Client
https://github.com/anatolii-dotsenko/gallery-frontend
### Screenshots
