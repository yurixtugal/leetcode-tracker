import { Amplify } from "aws-amplify";
import { config } from "./config";

console.log("🔧 Amplify Configuration:", {
  apiUrl: config.apiUrl,
  userPoolId: config.cognito.userPoolId,
  userPoolClientId: config.cognito.userPoolClientId,
  region: config.cognito.region,
});

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.cognito.userPoolId,
      userPoolClientId: config.cognito.userPoolClientId,
      loginWith: {
        email: true,
      },
    },
  },
});

console.log("✅ Amplify configured successfully");

export default Amplify;
