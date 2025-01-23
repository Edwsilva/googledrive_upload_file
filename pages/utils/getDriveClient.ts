import { google } from "googleapis";

function getDriveClient(accessToken) {
  console.log("getDrive ", accessToken);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}
