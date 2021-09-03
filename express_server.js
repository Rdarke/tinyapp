const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

// middleware use.
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}));

// Import helper functions. 
const { findUserByEmail, getUrlsByUser, generateRandomString, emailLookup } = require("./helpers");

// Url database by user id.
const urlDatabase = {};

// User database object.
const users = {};

//....
// Main Server GET Endpoints...............................
//....
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if (userID) {
    res.redirect("/urls");
  }
  res.render("main_home", templateVars);
});

// get endpoint.........................
app.get("/home", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if (userID) {
    res.redirect("/urls");
  }
  res.render("main_home", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// get endpoint.........................
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const urls = (getUrlsByUser(urlDatabase, (key) => key.userID === userID));
  const templateVars = { urls, user };

  if (!userID) {
    res.redirect("/permissions");
  }
  res.render("urls_index", templateVars);
});

// get endpoint.........................
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if(!userID) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// get endpoint.........................
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
  }
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

// get endpoint.........................
app.get("/u/:shortURL", (req, res) => { // need logic to send error message if /u/:shortURL ie :ID incorect 
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const longURL = urlsInfo.longURL;
  res.redirect(longURL);
});

// get endpoint.........................
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if(userID) {
    res.redirect("/urls");
  }
  res.render("register_user", templateVars);
});

// get endpoint.........................
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };

  if(userID) {
    res.redirect("/urls");
  }
  res.render("user_login", templateVars);
});

// get endpoint.........................
app.get("/permissions", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  
  if (userID) {
    res.redirect("urls");
  }
  res.render("permission_denied", templateVars);
});


//....
//Main server POST endpoints below.............................
//....
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  
  if(userID) {
  urlDatabase[shortURL] = { longURL, userID };
  }
  res.redirect(`/urls/${shortURL}`);
});

//post endpoint..................
app.post("/urls/:shortURL/delete", (req, res) => { 
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const urlsID = urlsInfo.userID;

  if (userID === urlsID) {
    delete urlDatabase[shortURL];
  }
  res.redirect("/urls");
});

// post endpoint................
app.post("/urls/:shortURL/edit", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  const urlsInfo = urlDatabase[shortURL];
  const urlsID = urlsInfo.userID;

  if (userID === urlsID ) {
    res.redirect(`/urls/${shortURL}`)
  }
});

// post endpoint.................
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL, userID }
  res.redirect(`/urls`);
});

// post endpoint...................
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = (findUserByEmail(users, (key) => key.email === email));
  const user = users[userID];
  const hashedPassword = user.hashedPassword;
  
  if (emailLookup(email, users) === false) {
    res.status(403).send("<html><body><b>Error 403</b> - Must include valid email! Return to the previous page</body></html>\n");
  } 
  else if (bcrypt.compareSync(password, hashedPassword) === false) {
    res.status(403).send("<html><body><b>Error 403</b> - Incorrect password! Return to the previous page</body></html>\n");
  }
  req.session.user_id = userID;
  res.redirect(`/urls`);
});

// post endpoint....................
app.post("/logout", (req, res) => {
  const userID = req.session.user_id;

  req.session = null;
  res.redirect(`/login`);
});

// post endpoint......................
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email.length === 0 || password.length === 0) {
    res.status(400).send("<html><body><b>Error 400</b> - Must include a valid email & password! Return to the previous page</body></html>\n");
  }
  else if (emailLookup(email, users) === true) {
    res.status(400).send("<html><body><b>Error 400</b> - Email in use! Return to the previous page</body></html>\n");
  } else {
    users[userID] = { id: userID, email, hashedPassword };
  }
  console.log("Users Object ==:", users);
  req.session.user_id = userID;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});