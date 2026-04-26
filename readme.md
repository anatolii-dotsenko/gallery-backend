# lab29. Тестування з fixture-патерном

Це серверна частина додатку, яка забезпечує REST API, роботу з файловою системою, збереження файлів у базу даних та WebSocket-з'єднання.

## Technologies Used
* **Сервер:** Node.js + Express
* **Мова:** TypeScript
* **База даних:** MongoDB (`mongoose`, `mongodb`) з використанням **GridFS** для збереження зображень більших розмірів.
* **Обробка файлів:** `multer` (для прийому файлів від клієнта перед збереженням у БД).
* **Dependency Injection:** `tsyringe` та `reflect-metadata` (забезпечує слабку зв'язність сервісів `IFileService`, `IContentService`).
* **Real-time зв'язок:** `socket.io` (передача стану слайдера всім підключеним клієнтам).
* **Тестування:** `jest` + `ts-jest` (юніт-тестування сервісів із використанням моків, наприклад, модулю `fs`).

## How to Run
### Для коректної роботи завантаження файлів необхідно, щоб на вашому комп'ютері була запущена локальна база даних **MongoDB** (стандартний порт `27017`).
```bash
docker run -d -p 27017:27017 --name my-mongodb mongo:latest
```
### Start the Server
```bash
cd server
npm install
npm run build
npm start
http://localhost:3000
```
### Tests
```bash
npm test
```
### Screenshots
<img width="571" height="239" alt="image" src="https://github.com/user-attachments/assets/4f05e57e-0541-4433-b319-e9c8348a81d7" />
