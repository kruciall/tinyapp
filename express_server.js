const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const { getUserByEmail, generateRandomString, urlsForUser, users, urlDatabase } = require('./helpers');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["secret keys", "secret keys 2"]
}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});


// Renders List of URLS for given user
app.get("/urls", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));

  const templateVars = {
    urls: urlsForGivenUser,
    user: users[req.session.user_id]
  };

  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", templateVars);
});

// Renders page where users can create URLS
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

// Renders page where users can view and edit their short url. If user is not logged in redirect to login page
app.get("/urls/:id", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_show", templateVars);
});


//redirects to corresponding longURL for respective short URL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("No Corresponding long URL found.");
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//Route to create new URLS
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.send("Can't shorten URL if you're not logged in");
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${id}`);
});

// Deletes short URL
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

//Editing longURL
app.put("/urls/:id", (req, res) => {
  const urlsForGivenUser = (urlsForUser(urlDatabase, req.session.user_id));
  if (urlsForGivenUser[req.params.id] === undefined) {
    res.status(403).send("You do not have any URLS");
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});


//Renders register page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: users[req.session.user_id] };
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register", templateVars);
});

//registers a new user
app.post("/register", (req, res) => {
  
  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === "" || password === "") {
    res.status(400).send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const findEmail = getUserByEmail(users, email);
  
  if (findEmail) {
    res.status(400).send("Email has been already registered, please log in!");
    return;
  }
  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect("/urls");
});

//renders login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[req.session.user_id] };
  if (userID) {
    res.redirect("/urls");
    return;
  }
  res.render("login", templateVars);
});

//route to log in an existing user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  if (!email || !password) {
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

// Logs user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});