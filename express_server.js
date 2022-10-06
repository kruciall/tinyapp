const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "vw@gmail.com",
    password: "1312",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


const getUserByEmail = function(database, email) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const urlsForUser = function(database, id) {
  const match = {};
  for (const url in database) {
    if (database[url].userID === id) {
      match[url] = database[url].longURL;
    }
  }
  return match;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.cookies.user_id));
  const templateVars = { urls: urlsForGivenUser, user: users[req.cookies.user_id] };

  
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies.user_id] };
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.cookies.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {// MY URLS MAIN PAGE
  const user = users[req.cookies.user_id];
  if (!user) {
    res.send("Can't shorten URL if you're not logged in fam");
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL === undefined) {
    res.status(400).send("Short URL does not exist"); //CHAIN ALL THE OTHER ONES LIKE THIS
    return;
  }
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => { // DELETE
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.cookies.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => { // EDIT
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.cookies.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: users[req.cookies.user_id] };
  console.log(user);
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {

  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const findEmail = getUserByEmail(users, email);

  if (email === "" || password === "") {
    res.sendStatus(400);
    res.send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  if (findEmail) {
    res.sendStatus(400);
    res.send("Email has been already registered, please log in!");
    return;
  }
  users[id] = { id, email, hashedPassword };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  const templateVars = { user: users[req.cookies.user_id] };
  if (userID) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  const user = getUserByEmail(users, email);
  console.log(user);
  if (email === "" || password === "") {
    res.status(400).send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  if (!user) {
    res.status(400).send("This email does not exist!");
    return;
  }
  if (!bcrypt.compareSync(password, hashedPassword)) {
    res.status(400).send("Incorrect Password!");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});