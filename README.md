This chess website is a project in full-stack web development.

It is possible to play opponents both online and offline, as well as against the computer.

The deployed site can be found at https://chess-client-2upu.onrender.com/#/.

To run locally:

Using Docker:

Clone the repository and cd inside. <br>
run ```docker compose up -d```

Manually:

Ensure the node version is at least v23.3.0. <br>
Clone the repository. <br>
Start the backend server by running ```npm run start```. <br>
Start the frontend by running ```npm run dev```. <br>

Note: make sure to run the backend on port 1234 and the frontend on port 3000. <br>
These can be changed in the client/src/api.js and the server/index.js files.
