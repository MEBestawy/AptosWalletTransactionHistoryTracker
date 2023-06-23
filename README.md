## Design Decisions & Considerations

### Overview
The project is divided into 3 micro-services: The Cronjob Service, the API Service and the Database Service. 

The Cronjob Service is responsible for running the cronjob that fetches the data from the API and stores it in the database. The API Service is responsible for serving the data from the Aptos API to the other services. The Database Service is responsible for storing the data from the API.

An additional `frontend` codebase is also provided to demo the use of the API.

### Why Microservices?
Separating different functionalities into different services allows for better scalability and maintainability. For example, if the API Service is experiencing a lot of traffic, we can scale it up without affecting the other services.

Additionally, this approach allows for different services to process information concurrently, whereas a monolithic approach would involve a single process to handle one request at a time. For example, the Cronjob Service can be fetching data from the API while the API Service is serving data to the frontend.

### Drawbacks of Design
A monolithic approach would be simpler to implement and maintain. Problems occurred in the microservices approach where ORM models had to be shared between services. This could be solved by creating a shared library, but it is not implemented in this project.

Since our service is not dealing with live data, nor is it expected to experience a lot of traffic, a monolith's poor scalability may have little impact on the service performance.


## How to Run
### API Fetcher
Run the following commands in the `api-data-fetcher-service` directory:
```
cp .env.example .env
npm i
npm run build
npm run start
```

### Cronjob Service
Run the following commands in the `scheduled-data-updates-service` directory:
```
cp .env.example .env
npm i
npm run build
npm run start
```

### DB Service
Run the following commands in the `transaction-database-service` directory:

First, run `cp .env.example .env` and populate the `.env` file with the appropriate information pointing to your PSQL DB.
```
npm i
npx prisma migrate deploy
npm run build
npm run start
```

### Frontend
Run the following commands in the `frontend` directory:
```
cp .env.example .env
npm i
npm start
```