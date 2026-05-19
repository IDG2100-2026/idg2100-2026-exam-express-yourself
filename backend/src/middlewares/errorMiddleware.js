// this will catch all errors passed with next(err) from any route
// keeping it in one place means we dont repeat error handling in every controller
export const errorHandler = (err, _req, res, _next) => {
  console.error(err.message);

  // this will catch duplicate value errors, like same username or email already exists
  // mongo error code 11000 means a unique field was violated
  if (err.code === 11000) {
    return res.status(400).json({ error: 'That value already exists' });
  }

  // this will catch mongoose validation errors, like a required field is missing
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // this will handle anything else we did not expect
  res.status(500).json({ error: 'Something went wrong' });
};
