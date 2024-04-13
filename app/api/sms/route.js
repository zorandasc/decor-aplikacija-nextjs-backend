// Your AccountSID and Auth Token from console.twilio.com
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export const POST = async (request, response) => {
  const body = await request.json();

  console.log(body);
  try {
    const message = await client.messages.create({
      body: "Svdbeni Cvet ima novu poruku za vas na zorand666@gmail.com",
      to: "+38766234417", // Text your number
      from: "+12514281722", // From a valid Twilio number
    });
    return new Response(
      JSON.stringify({ success: true, messageSid: message }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
};
