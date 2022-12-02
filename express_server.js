const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

//Database for URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//Database for users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  'abc123': {
    id: "abc123",
    email: "abc@example.com",
    password: "123",
  },
};

//Generates a random unique ID
const generateRandomString = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//function get user by email (create)
//Routes

// Get / Route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Get /urls.json Route
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get /hello Route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Get /urls Route
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  // console.log('user:', user);
  const templateVars = {
    user,
    urls: urlDatabase,
  };
 
  res.render("urls_index", templateVars);
});

//Post for user to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Get user and compare password and then if good set cookie
  res.cookie('user_id', 'abc123');

  res.redirect('/urls');

});



//Post for user to logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/urls');

});

//Create a new URL

// Get /urls/new Route
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  // console.log('user is:', user);
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// Post uniqueID to database for newURL
app.post("/urls", (req, res) => {
  const uniqID = generateRandomString(6);
  urlDatabase[uniqID] = req.body.longURL;
  res.redirect(`/urls/${uniqID}`);
});

//

//Create a new User

// Get /register Route
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {user};
  res.render("urls_register", templateVars);
});

// Post uniqueUsernameID to users for a newUser
app.post("/register", (req, res) => {
  const id = generateRandomString(6);
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', id);
  console.log('new user: ', users);
  res.redirect('/urls');
});


//

//Get /urls/:id to show the URL
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user,
  };
  res.render("urls_show", templateVars);
});

//Post /urls/:id to edit a url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.id;
  res.redirect('/urls');
});

//Get to go to the longURL from the shortURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Post to delete a URL
app.post('/urls/:id/delete', (req, res) => {

  const urlID = req.params.id;

  // Remove URL from database object
  delete urlDatabase[urlID];

  res.redirect('/urls');
});

//Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});