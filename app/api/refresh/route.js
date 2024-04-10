import * as jose from "jose";
import { User } from "@models/User";
import { connectToDB } from "@utils/database";
import { cookies } from "next/headers";

//API TACKA ZA GENRISANJE NOVOG ACCESS TOKENA
export const GET = async (req, res) => {
  //PROVJERI DA LI REQUEST UOPSTE IMA ODGOVARAJUCI COOKIE
  const cookie = cookies().get("jwt");

  if (!cookie?.value) return new Response("NO TOKEN VALUE", { status: 403 });
  const refreshToken = cookie.value;

  let foundUser = null;
  //AKO POSTIJI COOKIE, PROVJERI DA LI REFRESH TOKEN POSTOJI U BAZI
  try {
    await connectToDB();

    foundUser = await User.findOne({ refreshToken });

    //detected refresh token reuse,we receive cooke,
    //but not finded user, that mean that te refreshtoken
    //was previsusly invalidated
    if (!foundUser)
      return new Response("NO FOUND USER WITH THAT REFRESH TOKEN.", {
        status: 403,
      });
  } catch (error) {
    console.log("ERRROR FEOM /refresh", error);
    return new Response("SERVER ERROR", { status: 500 });
  }

  //AKO POSTOJI U BAZI DEKODIRAJ PRIMLJENI REFRES TOKEN I
  //VERIFIKUJ VJERODOSTOJNOST REFRESH TOKENA
  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const { payload } = await jose.jwtVerify(refreshToken, secret, {});

    const decoded = JSON.parse(payload.sub);

    if (foundUser.username !== decoded.username) {
      return new Response("REFRESH TOKEN INVALID1.", { status: 403 });
    }
    //SVE OK SA REFRESHTOKENOM, GENERISI NOVI ACCESSTOKEN
    //PREMA FRONTENDU
    const accessToken = await foundUser.generateAccessToken();

    return new Response(JSON.stringify({ accessToken }));
  } catch (error) {
    console.log("ERRROR FEOM /refresh", error);
    return new Response("REFRESH TOKEN INVALID2.", { status: 403 });
  }
};
