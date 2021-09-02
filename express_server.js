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

const emailLookup = (address, obj) => {
  let count = 0;
  for (let key in obj) {
    if (obj[key].email === address) {
    count += 1;
    }
  }
  if (count > 0) {
    return true;
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
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
  const userID = req.cookies["user_id"];
  const user = users[userID];
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
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };

  res.render("register_user", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user };

  res.render("user_login", templateVars);
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
  console.log("Req body: ", req.body);
  const email = req.body.email;
  console.log("Email: ", email);
  const password = req.body.password;
  console.log("Pass:", password);

  if (emailLookup(email, users) === false) {
    console.log("Email does not match our records");
    res.status(400).send("Error - Must include a valid email address! Return to the previous page :)");
  }
  if (emailLookup(email, users) === true && password !== users.id[email].password) {
    console.log("Email checks out but passwords no match:", users.id[email].password);
  }

  res.cookie("user_id", userID);
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
  
  if (email.length === 0 || password.length === 0) {
    console.log("No email");
    res.status(400).send("Error - Must include a valid email address! Return to the previous page :)");
  }
  else if (emailLookup(email, users) === true) {
    console.log("Email in use");
    res.status(400).send("Error - Email in use. Please return to the previous page.");
  } else {
    users[userID] = { id: userID, email, password };
  }
  res.cookie("user_id", userID);
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});