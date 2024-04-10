import { Order, validateOrder } from "@models/Order";
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

    const order = await Order.findOne({ _id: params.id }).select("-__v").exec();

    if (!order)
      return new Response("Narudžbina sa datim id ne postoji.", {
        status: 404,
      });

    return new Response(JSON.stringify(order), { status: 200 });
  } catch (error) {
    console.log("From Orders GET:ID", error);
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
    const existingOrder = await Order.findById(params.id);

    if (!existingOrder) {
      return new Response("Order not found", { status: 404 });
    }

    const body = await request.json();
    const { error } = validateOrder(body);

    if (error)
      return new Response(JSON.stringify(error.details[0].message), {
        status: 400,
      });

    // Update the prompt with new data
    existingOrder.status = body.status;
    existingOrder.developer = body.developer;
    existingOrder.customer = body.customer;
    existingOrder.address = body.address;
    existingOrder.listOfProduct = body.listOfProduct;
    existingOrder.avans = body.avans;
    existingOrder.totalPrice = body.totalPrice;
    existingOrder.orderDate = body.orderDate;
    existingOrder.deliveryTime = body.deliveryTime;
    existingOrder.note = body.note;

    //const body=await request.json();
    ///existingOrder={...body}

    await existingOrder.save();

    return new Response("Successfully updated the Order", { status: 200 });
  } catch (error) {
    console.log("From Orders PUT:", error);
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

    const order = await Order.findByIdAndDelete(params.id);

    if (!order)
      return new Response(`Porudžbina sa id: ${params.id} ne postoji.`, {
        status: 404,
      });

    return new Response(`Porudžbina sa id: ${params.id} obrisana.`, {
      status: 200,
    });
  } catch (error) {
    console.log("From Orders DELETE:", error);
    return new Response("Error deleting porudzbu", { status: 500 });
  }
};
