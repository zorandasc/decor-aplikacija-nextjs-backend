import { User, validateUser } from "@models/User";
import { connectToDB } from "@utils/database";
import bcrypt from "bcrypt";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

//SAMO ADMIN USER MOZE KREIRATI NOVOG USERA
export const POST = async (request) => {
  const authenticated = await checkAuthentication();

  if (!authenticated) {
    return new Response("NOT AUTHENTCATED.", { status: 403 });
  }

  const authorized = await checkAuthorization(authenticated, ROLES_LIST.Admin);

  if (!authorized) {
    return new Response("NOT AUTHORIZED.", { status: 401 });
  }

  try {
    const body = await request.json();

    //moraju postojati polja username i password
    const { error } = validateUser(body);
    if (error)
      return new Response(error.details[0].message, {
        status: 400,
      });

    await connectToDB();

    //da li vec postoji username u bazi
    const foundUser = await User.findOne({ username: body.username });
    if (foundUser)
      return new Response(
        "Korisnik aplikacije sa datim imenom vec registrovan.",
        { status: 401 }
      );

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(body.password, salt);

    await User.create({
      username: body.username,
      password: hashedPwd,
    });

    return new Response(
      JSON.stringify({ success: `New user ${body.username}, created!` }),
      { status: 201 }
    );
  } catch (error) {
    console.log("FROM REGISTER", error);
    return new Response("Failed to create a new user", { status: 500 });
  }
};
