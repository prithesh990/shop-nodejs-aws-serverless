import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./utils/apiResponseBuilder";
import { S3 } from "aws-sdk";

const BUCKET: string = process.env.BUCKET || "";

export interface EventRecord {
  queryStringParameters: {
    name: string;
  };
}

export interface ImportProductsFileProps {
  s3: S3;
}

export const importProductsFile =
  ({ s3 }: ImportProductsFileProps) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const queryStringParameters =
        event.queryStringParameters as EventRecord["queryStringParameters"];
      const catalogName = queryStringParameters.name;
      const catalogPath = `uploaded/${catalogName}`;

      const params = {
        Bucket: BUCKET,
        Key: catalogPath,
        Expires: 60,
        ContentType: "text/csv",
      };

      const url = await s3.getSignedUrlPromise("putObject", params);

      return successResponse(url);
    } catch (error: any) {
      return errorResponse(error);
    }
  };
