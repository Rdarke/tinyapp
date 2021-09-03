const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}));

// Imports helper functions. 
const { findUserByEmail, getUrlsByUser, generateRandomString, emailLookup } = require("./helpers");

// Url database by user id.
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

// User database object.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


// Main Server GET Endpoints.........................................
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if (userID) {
    res.redirect("/urls");
  };
  res.render("main_home", templateVars);
});

app.get("/home", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (userID) {
    res.redirect("/urls");
  };
  res.render("main_home", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const urls = (getUrlsByUser(urlDatabase, (key) => key.userID === userID));
  const templateVars = { urls, user };

  if (!userID) {
    res.redirect("/permissions");
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if(!userID) {
    res.redirect("/login");
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const urlsID = urlsInfo.userID;
  const longURL = urlsInfo.longURL;

  if (!userID) {
    res.redirect("/permissions");
  }
  else if (userID !== urlsID ) {
    res.redirect("/permissions");
  };
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { // need logic to send error message if /u/:shortURL ie :ID incorect 
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const longURL = urlsInfo.longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if(userID) {
    res.redirect("/urls");
  };
  res.render("register_user", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if(userID) {
    res.redirect("/urls");
  };
  res.render("user_login", templateVars);
});

app.get("/permissions", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if (userID) {
    res.redirect("urls");
  }
  res.render("permission_denied", templateVars);
});



//Main server POST endpoints...................................................
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  if(userID) {
  urlDatabase[shortURL] = { longURL, userID };
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => { 
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const urlsID = urlsInfo.userID;

  if (userID === urlsID) {
    delete urlDatabase[shortURL];
  };
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const urlsID = urlsInfo.userID;

  if (userID === urlsID ) {
    res.redirect(`/urls/${shortURL}`)
  };
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID }
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = (findUserByEmail(users, (key) => key.email === email));
  const user = users[userID];
  const hashedPassword = user.hashedPassword;
  
  if (emailLookup(email, users) === false) {
    res.status(403).send("Error 403 - Must include a valid email address! Return to the previous page :)");
  } 
  else if (bcrypt.compareSync(password, hashedPassword) === false) {
    res.status(403).send("Error 403 - Incorrect password! Return to the previous page :)");
  };
  req.session.user_id = userID;
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  const userID = req.session.user_id;

  req.session = null;
  res.redirect(`/login`);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Error 400 - Must include a valid email & password! Return to the previous page :)");
  }
  else if (emailLookup(email, users) === true) {
    res.status(400).send("Error 400 - Email in use. Please return to the previous page.");
  } else {
    users[userID] = { id: userID, email, hashedPassword };
  };
  console.log("Users Object ==:", users);
  req.session.user_id = userID;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});