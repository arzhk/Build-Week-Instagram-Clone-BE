const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const userSchema = new Schema(
  {
    /* SCHEMA TO BE BUILT */
    name: {
      type: String,
      required: [true, "Type your Name"],
    },
    surname: {
      type: String,
      required: [true, "Type your Surname"],
    },
    image: {
      type: String,
      default: "https://res.cloudinary.com/dwx0x1pe9/image/upload/v1614858356/user_u6gubg.jpg",
    },
    username: {
      type: String,
      required: [true, "Type your Username"],
      unique: [true, "This username already exists"],
      minLength: [4, "Username is to short (4 characters minimum)"],
    },
    email: {
      type: String,
      required: [true, "Type your Email"],
      unique: [true, "This email already exists"],
    },
    password: {
      type: String,
      minLength: [4, "Password is to short (4 characters minimum)"],
    },
    following: [{ type: Schema.Types.ObjectId, ref: "users" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "users" }],
    refreshTokens: [{ token: { type: String } }],
    googleId: String,
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else return null;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.refreshTokens;
  if (userObject.googleId === "") delete userObject.googleId;
  return userObject;
};
userSchema.pre("save", async function (next) {
  const user = this;
  user.role = "user";

  if (!user.password) {
    user.password = crypto.randomBytes(12).toString("hex");
  }
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const user = this.getUpdate();

  const current = await UserSchema.findOne({ username: user.username });
  if (user.password) {
    const isMatch = await bcrypt.compare(user.password, current.password);
    if (!isMatch) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

const UserSchema = model("users", userSchema);

module.exports = UserSchema;
