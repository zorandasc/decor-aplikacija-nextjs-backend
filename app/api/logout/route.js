import { User } from "@models/User";
import { connectToDB } from "@utils/database";
import { cookies } from "next/headers";

//on client also delete accestoken
export const GET = async (req, res) => {
  //check if coookie exsist
  // Check for cookie
  const cookie = cookies().get("jwt");

  if (!cookie.value) return new Response("Buy Buy", { status: 200 }); //No content

  try {
    await connectToDB();
    //provjeri da li je token u requestu isti kao u bazi za tog korisnika
    const foundUser = await User.findOne({ refreshToken: cookie.value });
    if (foundUser) {
      //obrisi refreshtoken iz baze
      foundUser.refreshToken = "";
      await foundUser.save();
    }

    //secure znaci da only serve with https
    cookies().set("jwt", "", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(0),
    });

    return new Response("Buy Buy", {
      status: 200,
    });
  } catch (error) {
    return new Response("SERVER ERROR", { status: 500 });
  }
};
