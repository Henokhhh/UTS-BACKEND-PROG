const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

async function failedLoginAttempt(email) {
  let user = await User.findOneAndUpdate(
    { email },
    { $inc: { attempt: 1 } },
    { new: true } // This will return the updated document
  );
  console.log(user);

  if (user.attempt >= 5) {
    user = await User.findOneAndUpdate(
      { email },
      { $set: { lockedUntil: new Date(Date.now() + 60 * 1000) } },
      { new: true }
    );
  }

  console.log(user.lockedUntil + ' login attempts');
}

async function resetUserLoginAttempt(email) {
  return User.findOneAndUpdate(
    { email },
    { $set: { attempt: 0, lockedUntil: null } }
  );
}

module.exports = {
  getUserByEmail,
  failedLoginAttempt,
  resetUserLoginAttempt,
};
