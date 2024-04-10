import { connectToDB } from "@utils/database";
import { Order, validateOrder } from "@models/Order";
import { checkAuthentication, checkAuthorization } from "@utils/protection";
import ROLES_LIST from "@utils/roles_list";

export const GET = async (request, response) => {
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

    const orders = await Order.find({}).select("-__v");

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

  const { error } = validateOrder(body);

  if (error) {
    return new Response(JSON.stringify(error.details[0].message), {
      status: 400,
    });
  }

  try {
    await connectToDB();

    const newOrder = new Order({
      status: body.status,
      developer: body.developer,
      customer: body.customer,
      address: body.address,
      listOfProduct: body.listOfProduct,
      avans: body.avans,
      totalPrice: body.totalPrice,
      deliveryTime: body.deliveryTime,
      orderDate: body.orderDate,
      note: body.note,
      orderId: undefined,
    });

    await newOrder.save();

    return new Response(JSON.stringify(newOrder), { status: 201 });
  } catch (error) {
    console.log("FROM route.js", error);
    return new Response("Failed to create a new order", { status: 500 });
  }
};
