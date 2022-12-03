const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, getUrlsForUser} = require("./helper");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

//Middleware
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'express_app_session_id',
  keys: ['key1', 'key2'],
}));

//Database for URLs
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc123",
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: "abc123",
  },
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

//Login/Logout route

// Get /login Route
app.get("/login", (req, res) => {
  const userId = req.session.userSessId;

  const user = users[userId];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user };
    res.render("urls_login", templateVars);
  }
});

//Post for user to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Look for a current user with inputted email
  const lookUpUser = getUserByEmail(email, users);
  if (lookUpUser === undefined) {
    return res.status(403).send('Email not found. Please register!');
  }
  //If user is located with email address, compare password
  const checkPasswordBycript = bcrypt.compareSync(password, lookUpUser.password);
  if (checkPasswordBycript !== true) {
    return res.status(403).send('Password does not match. Please try again!');
  }

  //If email and password both match, set cookie
  req.session.userSessId = lookUpUser.id;
  res.redirect('/urls');

});

//Post for user to logout
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect('/login');

});

//

//Create a new User

// Get /register Route
app.get("/register", (req, res) => {
  const userId = req.session.userSessId;
  const user = users[userId];
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user };
    res.render("urls_register", templateVars);
  }
});

// Post /register route to create a new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //if Email already exists in the users object
  const lookUpUser = getUserByEmail(email, users);
  if (lookUpUser !== undefined) {
    return res.status(400).send('Email is already registered!');
  }

  //if email or password is empty
  if (!email || !password) {
    return res.status(400).send('Email or Password cannot be empty!');
  }
  //Create a new user
  const id = generateRandomString(6);
  users[id] = {
    id,
    email: req.body.email,
    password: hashedPassword,
  };
  console.log('new user:', users);
  req.session.userSessId = id;

  res.redirect('/urls');
});


//

// Get /urls Route
app.get("/urls", (req, res) => {
  const userId = req.session.userSessId;
  const user = users[userId];
  if (!user) {
    return res.send("Please login or register to view URLs!");
  } else {
    const lookUpUrls = getUrlsForUser(user.id, urlDatabase);
    const templateVars = {
      user,
      urls: lookUpUrls,
    };
    res.render("urls_index", templateVars);
  }
});

//Create a new URL

// Get /urls/new Route
app.get("/urls/new", (req, res) => {
  const userId = req.session.userSessId;

  const user = users[userId];
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
});

// Post uniqueID to database for newURL
app.post("/urls", (req, res) => {
  const userId = req.session.userSessId;
  const user = users[userId];

  if (!user) {
    return res.send("You need to be logged in to shorten URLs!");
  } else {
    const uniqID = generateRandomString(6);
    urlDatabase[uniqID] = {
      longURL: req.body.longURL,
      userID: user.id,
    };
    res.redirect(`/urls/${uniqID}`);
  }
});

//

//Get /urls/:id to show the URL
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userSessId;

  const user = users[userId];

  if (!user) {
    return res.send("Please login or register to view this page!");
  }
  const lookUpUrls = getUrlsForUser(user.id, urlDatabase);
  const urlKeys = Object.keys(lookUpUrls);
  if (!urlKeys.includes(req.params.id)) {
    return res.send("This is not your URL to edit or it does not exist!");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

//Post /urls/:id to edit a url
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.userSessId;

  const user = users[userId];
  const lookUpUrls = getUrlsForUser(user.id, urlDatabase);
  const userUrls = Object.keys(lookUpUrls);
  const urlKeys = Object.keys(urlDatabase);

  if (!urlKeys.includes(req.params.id)) {
    return res.send("URL id does not exist!");
  }
  if (!userUrls.includes(req.params.id)) {
    return res.send("Not your URL to edit!");
  }

  urlDatabase[id].longURL = req.body.id;
  res.redirect('/urls');
});

//Get to go to the longURL from the shortURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.send("Shortened url does not exist!");
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

//Post to delete a URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userId = req.session.userSessId;

  const user = users[userId];
  if (!user) {
    return res.send("Please login or register to view this page!");
  }
  const lookUpUrls = getUrlsForUser(user.id, urlDatabase);
  const userUrls = Object.keys(lookUpUrls);

  if (!userUrls.includes(req.params.id)) {
    return res.send("Not your URL to delete!");
  }

  const urlKeys = Object.keys(urlDatabase);
  if (!urlKeys.includes(req.params.id)) {
    return res.send("URL id does not exist!");
  }
  // Remove URL from database object
  delete urlDatabase[id];

  res.redirect('/urls');
});

//Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});