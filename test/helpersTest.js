const { assert, expect } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a userID Key using via email call back', function() {
    
    const output = findUserByEmail(testUsers, (key) => key.email === "user@example.com")
    const expectedOutput = "userRandomID";
    assert.strictEqual(output, expectedOutput);
  });
  it('Non-existent email should return undefined.', function() {
    
    const output = findUserByEmail(testUsers, (key) => key.email === "test@gmail.com")
    assert.strictEqual(output, undefined);
  });
});
