export function notFound(_req, res) {
  res.status(404).json({ message: 'That endpoint does not exist.' });
}

// Express 5 forwards errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Try again in a moment.' });
}
