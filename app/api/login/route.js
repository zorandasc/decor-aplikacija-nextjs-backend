const bcrypt = require("bcrypt");

import { User, validateUser } from "@models/User";
import { connectToDB } from "@utils/database";

export const POST = async (req, res) => {

  try {
    //validacija broja karaktera i struktura
    const body = await req.json();

    const { error } = validateUser(body);
    if (error)
      return new Response(JSON.stringify(error.details[0].message), {
        status: 400,
      });

    await connectToDB();

    // evaluate username
    const foundUser = await User.findOne({ username: body.username });
    if (!foundUser) return new Response("Korisni ne postoji.", { status: 401 });

    // evaluate password
    const match = await bcrypt.compare(body.password, foundUser.password);
    if (!match) return new Response("Ne validan password.", { status: 401 });

    const accessToken = await foundUser.generateAccessToken();

    const refreshToken = await foundUser.generateRefreshToken();

    //saving refreshtoken with current user
    foundUser.refreshToken = refreshToken;

    await foundUser.save();

    // Creates Secure Cookies with new refresh token
    //in header and new access token in body
    return new Response(JSON.stringify({ accessToken }), {
      status: 200,
      headers: {
        "Set-Cookie": `jwt=${refreshToken}`,
        HttpOnly: true,
        Secure: true,
        SameSite: "None",
        "Max-Age": `${24 * 60 * 60 * 1000}`,
        Path: "/",
      },
    });
  } catch (error) {
    return new Response("SERVER ERROR", { status: 500 });
  }
};
