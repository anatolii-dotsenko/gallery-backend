# lab27. Client-Server App: Dependency Injection & Testing

This project demonstrates a full-stack implementation of **Dependency Injection (DI)** using TypeScript, React, Node.js, and Socket.IO, along with Unit Testing.

## Technologies Used
- **Backend (Node.js/Express):** `tsyringe` for DI. The app resolves services (`FileService`, `ContentService`) from a central DI container.
- **Testing:** `jest` and `ts-jest` for unit testing the backend services with mocked file system (`fs`) dependencies.
- **Frontend (React):** `inversify`, `reflect-metadata` for DI. Logic is delegated to injectable services (`ApiService`, `ListRenderer`).
https://github.com/anatolii-dotsenko/react-client

## How to Run

### 1. Start the Server
```bash
cd server
npm install
npm run build
npm start
```
### Screenshot of test results
<img width="570" height="244" alt="image" src="https://github.com/user-attachments/assets/762ba511-6aff-4596-bc36-3e1ca86751a4" />
