const errorMiddleware = async (err, req, res, next) => {
  let formattedError = {};
  let typeText = "";

  if (err.httpStatusCode === 404) typeText = "Data not found.";
  if (err.httpStatusCode === 400) typeText = "Invalid data.";
  if (err.code === 11000) typeText = "Data already exists. (Must be unique)";

  if (err.errors) {
    let errorValues = Object.values(err.errors[0].msg.errors);
    let errorObject = errorValues.map((value) => {
      return { value: value.name, msg: value.message };
    });
    formattedError = { Errors: [...errorObject] };
  }
  if (err.code === 11000) {
    formattedError = { Errors: [{ msg: typeText, value: err.keyValue }] };
  } else {
    formattedError = { Errors: [{ msg: typeText, value: err.errors[0] }] };
  }

  if (formattedError.Errors[0].value.msg) {
    formattedError.Errors[0].value.msg = formattedError.Errors[0].value.msg.toString();
  }

  formattedError.httpStatusCode = err.httpStatusCode || 400;
  next(formattedError);
};

module.exports = { errorMiddleware };
