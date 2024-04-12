import { connectToDB } from "@utils/database";
import { User } from "@models/User";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

//GET ALL USERS
export const GET = async (request) => {
  const authenticated = await checkAuthentication();

  if (!authenticated) {
    return new Response("NOT AUTHENTCATED.", { status: 403 });
  }

  const authorized = await checkAuthorization(
    authenticated,
    ROLES_LIST.Admin,
    ROLES_LIST.User
  );

  if (!authorized) {
    return new Response("NOT AUTHORIZED.", { status: 401 });
  }
  
  try {
    await connectToDB();

    const users = await User.find({});

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all users", { status: 500 });
  }
};

