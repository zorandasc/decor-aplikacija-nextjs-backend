import { Offer, validateOffer } from "@models/Offer";
import { connectToDB } from "@utils/database";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

export const GET = async (request, { params }) => {
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

    const offer = await Offer.findOne({ _id: params.id }).select("-__v");

    if (!offer)
      return new Response("Narudžbina sa datim id ne postoji.", {
        status: 404,
      });

    return new Response(JSON.stringify(offer), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (request, { params }) => {
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

    // Find the existing prompt by ID
    const existingOffer = await Offer.findById(params.id);

    if (!existingOffer) {
      return new Response("Offer not found", { status: 404 });
    }

    const body = await request.json();
    const { error } = validateOffer(body);

    if (error)
      return new Response(error.details[0].message, {
        status: 400,
      });

    // Update the offer with new data
    existingOffer.status = body.status;
    existingOffer.customer = body.customer;
    existingOffer.address = body.address;
    existingOffer.pib = body.pib;
    existingOffer.mib = body.mib;
    existingOffer.contactPerson = body.contactPerson;
    existingOffer.contactEmail = body.contactEmail;
    existingOffer.contactTel = body.contactTel;
    existingOffer.listOfProduct = body.listOfProduct;
    existingOffer.avans = body.avans;
    existingOffer.totalPrice = body.totalPrice;
    existingOffer.dateOfIssue = body.dateOfIssue;
    existingOffer.dateOfValidity = body.dateOfValidity;
    existingOffer.placeOfIssue = body.placeOfIssue;
    existingOffer.methodOfPayment = body.methodOfPayment;
    existingOffer.note = body.note;

    //const body=await request.json();
    ///existingOffer={...body}

    await existingOffer.save();

    return new Response("Successfully updated the Offer", { status: 200 });
  } catch (error) {
    console.log("FROM OFFERS:", error);
    return new Response("Error Updating Prompt", { status: 500 });
  }
};

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

    const offer = await Offer.findByIdAndDelete(params.id);

    if (!offer)
      return new Response(`Ponuda sa id: ${params.id} ne postoji.`, {
        status: 404,
      });

    return new Response(`Ponuda sa id: ${params.id} obrisana.`, {
      status: 200,
    });
  } catch (error) {
    console.log("FROM OFFER DELETE", error);
    return new Response("Error deleting ponudu", { status: 500 });
  }
};
