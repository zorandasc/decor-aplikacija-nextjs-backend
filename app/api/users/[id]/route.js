import { User } from "@models/User";
import { connectToDB } from "@utils/database";

export const GET = async (request, { params }) => {
  try {
    await connectToDB();

    const user = await User.findOne({ _id: params.id }).exec();

    if (!user)
      return new Response(`User ID ${params.id} not found`, {
        status: 404,
      });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};


export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();

    const user = await User.findByIdAndRemove({ _id: params.id });

    if (!user)
      return new Response(`Korisnik aplikacije sa datim id ${params.id} ne postoji.`, {
        status: 404,
      });

    return new Response(`Korisnik: ${params.id} aplikacije obrisan.`, {
      status: 200,
    });
  } catch (error) {
    return new Response("Error deleting user", { status: 500 });
  }
};
