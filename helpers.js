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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };