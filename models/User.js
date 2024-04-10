const { Schema, models, model } = require("mongoose");
const Joi = require("joi");
import * as jose from "jose";

const UserSchema = new Schema({
  username: {
    type: String,
    unique: [true, "Email Already Exists"],
    required: [true, "Email is required!"],
    minlength: 4,
    maxlength: 50,
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    /*match: [
      /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      "Password invalid, it should contain 8-20 alphanumeric letters and be unique!",
    ],*/
    minlength: 5,
    maxlength: 1024, //HASHED PASSWORD TO MONGODB
  },
  roles: {
    User: {
      type: Number,
      default: 1981,
    },
    Admin: Number,
  },
  isAdmin: Boolean,
  refreshToken: String,
});

const alg = "HS256";

UserSchema.methods.generateAccessToken = async function () {
  return await new jose.SignJWT({})
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setSubject(
      JSON.stringify({
        UserInfo: {
          username: this.username,
          roles: Object.values(this.roles).filter(Boolean),
        },
      })
    )
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET));
};

UserSchema.methods.generateRefreshToken = async function () {
  return await new jose.SignJWT({})
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setSubject(JSON.stringify({ username: this.username }))
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET));
};

const User = models.User || model("User", UserSchema);

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(4).max(50).required(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
