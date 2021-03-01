const errorHandler = async (err, req, res, next) => {
  let error = await errorProcessor(err);
  res.send(error);
};

const errorProcessor = async (err, req, res, next) => {
  switch (err.httpStatusCode) {
    case 400:
      return err;
      break;
    case 401:
      return "Unauthorised request.";
      break;
    case 403:
      return "Forbidden request.";
      break;
    case 404:
      return err;
      break;
    case 405:
      return "Request not allowed.";
      break;
    case 406:
      return "Request not acceptable.";
      break;
    default:
      return "An unknown error has occurred.";
      break;
  }
};

module.exports = { errorHandler };
