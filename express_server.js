const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieParser());

function generateRandomString() {
  const length = 6
  return Math.random().toString(36).substr(4, length);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = { urls: urlDatabase, user };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  const userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = { shortURL, longURL, user };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = { user };

  res.render("register_user", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const { shortURL } = req.params;

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie("username", username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  const userID = req.cookies["user_id"]

  res.clearCookie("user_id", userID);
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  users[userID] = { id: userID, email, password };
  console.log(users);
  res.cookie("user_id", userID);
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});