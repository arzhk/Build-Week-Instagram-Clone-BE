const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const services = require("./services");
const cookieParser = require("cookie-parser");

const { errorMiddleware } = require("./errorMiddleware");
const { errorHandler } = require("./errorHandling");

const server = express();
const port = process.env.PORT || 3001;

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
server.use(cors(corsOptions));
server.use(express.json());
server.use(cookieParser());
server.use(loggerMiddleware);

server.use("/api", services);

server.use(errorMiddleware);
server.use(errorHandler);

mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(
    server.listen(port, () => {
      console.log("Server is running on port: ", port);
    })
  );
