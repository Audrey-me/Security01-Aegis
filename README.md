# Security01-Aegis
An automated security pipeline for Skyline Financial Technology using Github Actions.

# Base Repository
The starter repository was cloned from https://github.com/arorasanj/cpost-kids-banking

# Setup the Postgres database
1. Run the docker command to create the database, this creates an empty databse
```
    docker compose down -v
    docker compose up -d db
    docker compose ps          
```
2. Populate the empty database with tables by running the code in the server folder
```
    cd server
    npm run dev
```

3. Run the Frontend
```
    cd client
    npm install
    npm run dev
```
then open it up  http://localhost:8080/