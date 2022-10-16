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

const getUserByEmail = function(database, email) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

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

const urlsForUser = function(database, id) {
  const match = {};
  for (const url in database) {
    if (database[url].userID === id) {
      match[url] = database[url].longURL;
    }
  }
  return match;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser , users, urlDatabase};