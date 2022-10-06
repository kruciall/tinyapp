const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { getUserByEmail, generateRandomString, urlsForUser }  = require('./helpers');
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["secret keys", "secret keys 2"]
}));

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
  const templateVars = { urls: urlsForGivenUser, user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
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
  const user = users[req.session.user_id];
  if (!user) {
    res.send("Can't shorten URL if you're not logged in fam");
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL === undefined) {
    res.status(400).send("Short URL does not exist");
    return;
  }
  console.log(longURL);
  res.redirect(longURL);
});

app.delete("/urls/:id", (req, res) => { 
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: users[req.session.user_id] };
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
  console.log(findEmail);
  if (email === "" || password === "") {
    res.status(400).send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  if (findEmail) {
    res.status(400).send("Email has been already registered, please log in!");
    return;
  }
  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[req.session.user_id] };
  if (userID) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  if (email === "" || password === "") {
    res.status(400).send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  if (user === undefined) {
    res.status(400).send("This email does not exist!");
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).send("Incorrect Password!");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});
