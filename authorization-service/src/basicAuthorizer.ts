import {
  APIGatewayAuthorizerCallback,
  APIGatewayAuthorizerEvent,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";

const BASIC_AUTH_PREFIX = "Basic ";

const validateTokenAndAuthorize = (
  authorizationToken: string
): { isValid: boolean; name?: string } => {
  if (
    !authorizationToken ||
    !authorizationToken.startsWith(BASIC_AUTH_PREFIX)
  ) {
    return { isValid: false };
  }

  const base64Token = authorizationToken.replace(BASIC_AUTH_PREFIX, "");
  const decodedToken = Buffer.from(base64Token, "base64").toString("ascii");
  const [name, password] = decodedToken.split(":");

  if (name && password && process.env[name] === password) {
    return { isValid: true, name };
  }

  return { isValid: false };
};

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: "Allow" | "Deny"
) => ({
  principalId,
  policyDocument: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

export const basicAuthorizer = (
  event: any,
  _context: unknown,
  callback: APIGatewayAuthorizerCallback
) => {
  const {
    methodArn = "",
    headers: { Authorization },
  } = event;

  try {
    const { isValid, name } = validateTokenAndAuthorize(Authorization);

    if (isValid && name) {
      callback(null, generatePolicy(name, methodArn, "Allow"));
    } else {
      callback(null, generatePolicy(name || "user", methodArn, "Deny"));
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error);

    // 500 Internal Server Error
    callback(null, generatePolicy("user", methodArn, "Deny"));
  }
};
