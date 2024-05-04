// Your AccountSID and Auth Token from console.twilio.com
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

export const POST = async (request, response) => {
  const body = await request.json();
  /*
  client.lookups.v2
    .phoneNumbers("+381649977288")
    .fetch()
    .then((phone_number) => console.log(phone_number));
  return new Response(JSON.stringify({ }), {
    status: 201,
  });
  */

  try {
    const message = await client.messages.create({
      body: `Svdbeni Cvet ima novu poruku za vas: Korisnik: ${body.name}. Email: ${body.email}. Vise detalja na: dekoracijasvadbenicvet@gmail.com`,
      to: "+381649977288", // Text your number
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
