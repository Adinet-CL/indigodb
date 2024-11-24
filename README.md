# **IndigoDB**

IndigoDB is a lightweight ORM for Node.js, supporting both PostgreSQL and MongoDB with real-time updates through WebSockets. Inspired by Firebase's real-time database functionality, IndigoDB simplifies API creation by abstracting database operations and providing built-in support for real-time data synchronization.

## **Features**

- **Dual Database Support**: Works seamlessly with PostgreSQL and MongoDB.
- **Real-Time Updates**: Synchronizes database changes in real-time using WebSockets.
- **Simple API**: Developers can focus on logic without worrying about database or WebSocket configuration.
- **TypeScript Support**: Fully typed for improved developer experience.
- **Schema-Based Models**: Define models and let IndigoDB handle the rest (CRUD, real-time updates, etc.).

---

## **Installation**

### **Backend (Node.js)**

To use IndigoDB in your Node.js backend project:

```bash
npm install indigodb
```

### **Frontend (Angular)** _(Optional for Real-Time Frontend Integration)_

Coming soon...

---

## **Getting Started**

### **Backend Setup**

1. **Initialize IndigoDB**:
   Use the `initialize` function to configure your database and WebSocket server.

   ```typescript
   import { initialize, defineModel, DataTypes } from "indigodb";

   // Initialize the ORM
   await initialize({
     databaseType: "postgresql", // or 'mongodb'
     host: "localhost",
     port: 5432, // MongoDB users should provide `connectionString` instead
     user: "db_user",
     password: "db_password",
     database: "db_name",
     websocketPort: 8080, // WebSocket server port
   });
   ```

2. **Define a Model**:
   Define your models with schemas.

   ```typescript
   interface User {
     id: number;
     name: string;
     email: string;
   }

   const UserModel = defineModel<User>("users", {
     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
     name: { type: DataTypes.STRING },
     email: { type: DataTypes.STRING, unique: true },
   });
   ```

3. **Perform CRUD Operations**:
   Use the model to interact with your database.

   ```typescript
   // Create a new user
   const user = await UserModel.create({
     name: "John Doe",
     email: "john.doe@example.com",
   });

   // Find all users
   const users = await UserModel.findAll();

   // Update a user
   const updatedUser = await UserModel.update(user.id, { name: "Jane Doe" });

   // Delete a user
   await UserModel.delete(user.id);
   ```

### **Real-Time Frontend Integration**

IndigoDB provides built-in real-time updates through WebSockets. Any changes in the database (insert, update, delete) are sent to connected clients.

1. **Connect to WebSocket**:
   On the frontend, connect to the WebSocket server:

   ```typescript
   const socket = new WebSocket("ws://localhost:8080");

   socket.onmessage = (event) => {
     const message = JSON.parse(event.data);
     console.log("Real-time update:", message);
   };
   ```

2. **Receive Updates**:
   Handle real-time updates in your frontend application.

---

## **API Reference**

### **Backend**

#### `initialize(config: Config): Promise<void>`

Initializes the ORM with database and WebSocket configurations.

- `config`:
  - `databaseType`: `'postgresql'` or `'mongodb'`
  - `host`, `port`, `user`, `password`, `database` (PostgreSQL)
  - `connectionString` (MongoDB)
  - `websocketPort`: Port for the WebSocket server

#### `defineModel<T>(name: string, schema: ModelSchema): Model<T>`

Defines a model with the given schema.

- `name`: Name of the database table/collection.
- `schema`: Object defining the model schema, including types and constraints.

#### **Model Methods**

1. **`create(data: Partial<T>): Promise<T>`**
   Creates a new record in the database.

2. **`findAll(criteria?: Partial<T>): Promise<T[]>`**
   Retrieves all records matching the criteria.

3. **`findById(id: any): Promise<T | null>`**
   Retrieves a record by its ID.

4. **`update(id: any, data: Partial<T>): Promise<T | null>`**
   Updates a record by its ID.

5. **`delete(id: any): Promise<T | null>`**
   Deletes a record by its ID.

---

## **Supported Data Types**

IndigoDB supports the following data types:

| IndigoDB Type | PostgreSQL Type | MongoDB Type |
| ------------- | --------------- | ------------ |
| `INTEGER`     | `INTEGER`       | `Number`     |
| `STRING`      | `VARCHAR(255)`  | `String`     |
| `FLOAT`       | `REAL`          | `Number`     |
| `BOOLEAN`     | `BOOLEAN`       | `Boolean`    |
| `DATE`        | `TIMESTAMP`     | `Date`       |
| `TEXT`        | `TEXT`          | `String`     |
| `JSON`        | `JSON`          | `Object`     |

---

## **Real-Time Updates**

IndigoDB uses PostgreSQL triggers and MongoDB change streams to send real-time updates to connected WebSocket clients.

### **PostgreSQL Setup**

IndigoDB automatically creates triggers for your models to notify changes via `pg_notify`.

### **MongoDB Setup**

Ensure MongoDB is running as a replica set to enable change streams.

---

## **Testing**

To run tests, make sure you have `jest` and the required database instances running. Use the following command:

```bash
npm test
```

---

## **Roadmap**

- Add support for other databases (e.g., MySQL, SQLite).
- Provide a frontend library for Angular with full TypeScript support.
- Improve real-time capabilities with custom WebSocket events.

---

## **Contributing**

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`feature/my-new-feature`).
3. Commit your changes (`git commit -m 'Add my feature'`).
4. Push to the branch (`git push origin feature/my-new-feature`).
5. Open a pull request.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
