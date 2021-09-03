// Function will return a users ID key via the users database. 
const findUserByEmail = (obj, cb) => {
  for (let key in obj) {
    if (cb(obj[key])) {
      return(key);
    }
  }
};

// Function will create a random string to be used for ID values
function generateRandomString() {
  const length = 6
  return Math.random().toString(36).substr(4, length);
};

// Function will return true or false if a users email is stored within the database.
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

//Function will return a spcifed users "urls" via a new object.  
const getUrlsByUser = (obj, cb) => {
  let urls = {}
  for (let key in obj) {
    if (cb(obj[key])) {
      const longURL = obj[key].longURL;
      urls[key] = longURL;
    }
  }
  return(urls);
};

//Do not modify.
module.exports = {
  findUserByEmail, 
  getUrlsByUser, 
  generateRandomString, 
  emailLookup
}