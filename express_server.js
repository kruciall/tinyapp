const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {// MY URLS MAIN PAGE
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => { // DELETE
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => { // EDIT
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // if email or password are empty strings send back a response with400 status code
  //if someones tries to register with an email that is already in the users object, send back a respons with the 400 status code¸

  const id = generateRandomString(6);
  const email = req.body.email;
  const password = req.body.password;
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
  users[id] = { id, email, password };
  console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = users[req.cookies.user_id];
  res.render("login");
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(users, email);
  console.log(user);
  if (email === "" || password === "") {
    res.sendStatus(403);
    res.send("Email or Password input is empty, please enter a valid email and password");
    return;
  }
  if (!user) {
    res.sendStatus(403);
    res.send("This email does not exist!");
    return;
  }
  if (password !== user.password) {
    res.sendStatus(403);
    res.send("Incorrect Password!");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});