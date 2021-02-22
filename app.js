const { json } = require("express");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
let refreshTokens = [];

//mock data 
const users = [
    {
        id: 1,
        name: "phanith",
        username: "nith",
        password: "123",
        role: "admin"
    },
    {
        id: 2,
        name: "anonymos",
        username: "mario",
        password: "123",
        role: "member"
    },
    {
        id: 3,
        name: "hello",
        username: "lili",
        password: "123",
        role: "member"

    },
    {
        id: 4,
        name: "jonh",
        username: "apple",
        password: "123",
        role: "member"

    },
];

//---

app.get("/api", (req, res) => {
    console.log("welcome home page");
    res.json({ message: "Hello nodejs" });
});

app.post("/api/posts", verifyToken, (req, res) => {
    const { role } = req.user;


    if (role !== 'admin') {
        console.log(role);
        return res.sendStatus(403);
    }
  
    const postUser = req.body;
    console.log(postUser);
    users.push(postUser);
    res.json(users);
});

app.post("/api/login", (req, res) => {

    // Read username and password from request body
    const { username, password } = req.body;

    // Filter user from the users array by username and password
    const user = users.find(u => { return u.username === username && u.password === password });
    if (user) {
        // Generate an access token
        const token = jwt.sign({ username: user.username, role: user.role }, "secretkey",{ expiresIn: '1m' });

        const refreshToken = jwt.sign({ username: user.username, role: user.role }, "secretkey");
        refreshTokens.push(refreshToken);

        res.json({
            token,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
   
    if (typeof bearerHeader !== "undefined") {
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        jwt.verify(token, "secretkey", (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}

app.get("/api/users", verifyToken, (req, res) => {

    res.json(users);
});

app.post('/api/token', (req, res) => {
    const { token } = req.body;
// if client not add token from request
    if (!token) {
        return res.sendStatus(401);
    }

    // refreshtokens has value same with [token] or not
    if (!refreshTokens.includes(token)) {
        console.log(`refreshTokens -> ${refreshTokens}`);
        console.log('token ' + token);
      
        console.log("dont' have refresh token");
        return res.sendStatus(403);
    }
    
    jwt.verify(token, "secretkey", (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const token = jwt.sign({ username: user.username, role: user.role }, "secretkey", { expiresIn: '1m' });

        res.json({
            token
        });
    });
});

app.post('/api/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => token !== token);
    res.send("Logout successful");
});


app.listen(5000, () => {
    console.log("server started on port 500");
});
