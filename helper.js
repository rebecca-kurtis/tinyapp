//Function - Get the User by their inputted email
const getUserByEmail = (email, database) => {
  let foundUser = undefined;
  for (const userId in database) {
    const user = database[userId];

    if (email === user.email) {
      foundUser = user;
    }
  }
  return foundUser;
};

//Function - Generates a random unique ID
const generateRandomString = (length) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//Function - Look up URLs by userId
const getUrlsForUser = (id, database) => {
  let foundUrls = {};
  for (const userId in database) {
    const urls = database[userId];

    if (id === urls.userID) {
      foundUrls[userId] = database[userId];
    }
  }
  return foundUrls;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  getUrlsForUser,
};