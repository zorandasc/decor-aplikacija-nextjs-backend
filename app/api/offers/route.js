import { connectToDB } from "@utils/database";
import { Offer, validateOffer } from "@models/Offer";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

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

    const orders = await Offer.find({}).select("-__v");

    if (!orders) return new Response("No Orders found.", { status: 204 });

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch all users", { status: 500 });
  }
};



export const POST = async (request) => {
  const authenticated = await checkAuthentication();

  if (!authenticated) {
    return new Response("NOT AUTHENTCATED.", { status: 403 });
  }

  const authorized = await checkAuthorization(authenticated, ROLES_LIST.Admin);

  if (!authorized) {
    return new Response("NOT AUTHORIZED.", { status: 401 });
  }
  
  const body = await request.json();

  const { error } = validateOffer(body);

  if (error)
    return new Response(error.details[0].message, {
      status: 400,
    });

  try {
    await connectToDB();

    const newOffer = new Offer({
      status: body.status,
      customer: body.customer,
      address: body.address,
      pib: body.pib,
      mib: body.mib,
      contactPerson: body.contactPerson,
      contactEmail: body.contactEmail,
      contactTel: body.contactTel,
      listOfProduct: body.listOfProduct,
      avans: body.avans,
      totalPrice: body.totalPrice,
      dateOfIssue: body.dateOfIssue,
      dateOfValidity: body.dateOfValidity,
      placeOfIssue: body.placeOfIssue,
      methodOfPayment: body.methodOfPayment,
      note: body.note,
    });

    await newOffer.save();

    return new Response(JSON.stringify(newOffer), { status: 201 });
  } catch (error) {
    return new Response("Failed to create a new Offer", { status: 500 });
  }
};