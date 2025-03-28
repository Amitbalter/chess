This chess website is a project in full-stack web development.

It is possible to play opponents both online and offline, as well as against the computer.

The deployed site can be found at https://chess-client-2upu.onrender.com/#/.

To run locally:

Using Docker:

Clone the repository and cd inside. <br>
run ```docker compose up -d```

Manually:

Requirements: Node (v23.3.0) PostgreSQL (16.8)

Clone the repository. <br>
Run ```npm install``` in both client and server to install node_modules. <br>
Create ```.env.development``` (```.env.production``` for production) file in root of server with ```PGDATABASE``` variable set to name of database. <br>
Run ```npm run start``` to start the backend server. <br>
Run ```npm run dev``` to start the frontend. <br>

Note: make sure to run the backend on port 1234 and the frontend on port 3000. <br>
These can be changed in the client/src/api.js and the server/index.js files.
