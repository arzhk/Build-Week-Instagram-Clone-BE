const jwt = require("jsonwebtoken");

const authenticate = async (user) => {
  try {
    const newAccessToken = await generateJWT({ _id: user._id });

    await user.save();

    return { token: newAccessToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (error, token) => {
        if (error) rej(error);
        res(token);
      }
    )
  );

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) rej(error);
      res(decoded);
    })
  );

  module.exports = { authenticate, verifyJWT }