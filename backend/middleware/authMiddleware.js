// authMiddleware.js
// -----------------------------------------------------------------
// This function runs BEFORE any "protected" route handler.
// Why: the requirement says a user should NOT be able to use the
// app without being logged in, so we check the session cookie
// on every protected request instead of trusting the front end.
// -----------------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session || !req.session.userId) {
    // 401 = "Unauthorized" -> front end will redirect to login page
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }
  next(); // user is logged in, continue to the actual route handler
}

module.exports = { requireLogin };
