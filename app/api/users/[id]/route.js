import { User } from "@models/User";
import { connectToDB } from "@utils/database";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

//SAMO ADMIN USER MOZE VIDJETI STANJE SVAKOG USERA
export const GET = async (request, { params }) => {
  const authenticated = await checkAuthentication();

  if (!authenticated) {
    return new Response("NOT AUTHENTCATED.", { status: 403 });
  }

  const authorized = await checkAuthorization(authenticated, ROLES_LIST.Admin);

  if (!authorized) {
    return new Response("NOT AUTHORIZED.", { status: 401 });
  }
  try {
    await connectToDB();

    const user = await User.findOne({ _id: params.id }).select("-__v");

    if (!user)
      return new Response(`User ID ${params.id} not found`, {
        status: 404,
      });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};

//SAMO ADMIN USER MOZE DELETOVATI NOVOG USERA
export const DELETE = async (request, { params }) => {
  const authenticated = await checkAuthentication();

  if (!authenticated) {
    return new Response("NOT AUTHENTCATED.", { status: 403 });
  }

  const authorized = await checkAuthorization(authenticated, ROLES_LIST.Admin);

  if (!authorized) {
    return new Response("NOT AUTHORIZED.", { status: 401 });
  }

  try {
    await connectToDB();

    const user = await User.findByIdAndDelete(params.id);

    if (!user)
      return new Response(
        `Korisnik aplikacije sa datim id ${params.id} ne postoji.`,
        {
          status: 404,
        }
      );

    if (user.username === "lidija") {
      return new Response(
        `Korisnik aplikacije lidija je admin korisnik i nemoze biti obrisan sa sistema.`,
        {
          status: 404,
        }
      );
    }

    return new Response(`Korisnik: ${params.id} aplikacije obrisan.`, {
      status: 200,
    });
  } catch (error) {
    console.log("FROM USERS:", error);
    return new Response("Error deleting user", { status: 500 });
  }
};
