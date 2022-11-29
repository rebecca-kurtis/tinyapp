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

//Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

//Post for user to login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);

  res.redirect('/urls');
  
});

//Post for user to logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
  
});

//Create a new URL

// Get /urls/new Route
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

// Post uniqueID to database for newURL
app.post("/urls", (req, res) => {
  const uniqID = generateRandomString(6);
  urlDatabase[uniqID] = req.body.longURL;
  res.redirect(`/urls/${uniqID}`);
});

//

//Get /urls/:id to show the URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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