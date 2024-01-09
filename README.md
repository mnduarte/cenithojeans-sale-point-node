# it-crowd-server

A server in which you can manage games, also it generates a token that is then used in a middlaware to verify the user status.

## Installation

1. Clone the repository: `git clone https://github.com/mnduarte/it-crowd-server.git`.
2. Install the dependencies: `npm install`.
3. Create a `.env.local` file with the project configuration information. You can follow the example of the `.env.example` file.

## Migrate

NoSql mongoDb database is used, it is necessary to have it installed.

- `npm run updatedb`: generate a default user and do a bulk insert of 20000 sets.

## Scripts

- `npm run start:dev`: runs the server in development mode, using `nodemon` and `node-dev`.

## Collection

- You can import the `it-crowd.postman_collection.json` to see all endpoints, it is recommended to start with the Auth/login endpoint execution, extract the token value and add it as environment variable, to have all endpoints available.

## Debug

- You can also run "Launch Node nodemon" to track through breakpoints.
