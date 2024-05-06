const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    await authenticationRepository.resetUserLoginAttempt(email);

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  await authenticationRepository.failedLoginAttempt(email);

  return null;
}

async function isAccountLocked(email) {
  const user = await authenticationRepository.getUserByEmail(email);

  //check login attempt first if already have lockedUntil return false
  if (user.lockedUntil == null) {
    return false;
  } else if (user.lockedUntil > Date.now()) {
    return true;
  } else if (user.lockedUntil < Date.now()) {
    const user = await authenticationRepository.resetUserLoginAttempt(email);
    console.log('User here: ' + user);
    return false;
  }

  return false;
}

module.exports = {
  checkLoginCredentials,
  isAccountLocked,
};
