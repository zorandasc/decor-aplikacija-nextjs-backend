import { headers } from "next/headers";
import * as jose from "jose";

//CHECK VALIDITY OF ACCESSTOKEN IN HEADER AUTORIZATION=BEARER
export async function checkAuthentication() {
  const authHeader =
    headers().get("authorization") || headers().get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    //return NextResponse.next({ headers: response.headers, status: 403 }); // NOT AUTHENTCATED
    return false;
  }
  const accessToken = authHeader.split(" ")[1];

  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const { payload } = await jose.jwtVerify(accessToken, secret, {});

    return payload; //AUTHENTCATED
  } catch (error) {
    return false; // NOT AUTHENTCATED
  }
}

//AUTHORIZACIJA, ONLY ALLOWED ROLES CAN MODIFY RESURSES
export function checkAuthorization(receivedPayload, ...allowedRoles) {
  const decoded = JSON.parse(receivedPayload.sub);

  const receivedRoles = decoded.UserInfo?.roles;

  if (!receivedRoles) return false; //NOT AUTORHIZED

  const rolesArray = [...allowedRoles];

  //mapira receivedRoles u array of [false, true], pronaci bar jedan true
  const matchedRoles = receivedRoles
    .map((role) => rolesArray.includes(role))
    .find((val) => val === true);

  if (!matchedRoles) return false; //NOT AUTORHIZED

  return true; //AUTHORIZED OK
}
