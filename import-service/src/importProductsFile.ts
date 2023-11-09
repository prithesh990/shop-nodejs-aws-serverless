import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { errorResponse, successResponse } from "./utils/apiResponseBuilder";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrlPromise } from "./utils/helper";

const BUCKET: string = process.env.BUCKET || "";

export interface EventRecord {
  queryStringParameters: {
    name: string;
  };
}

export interface ImportProductsFileProps {
  s3: S3Client;
}

export const importProductsFile =
  ({ s3 }: ImportProductsFileProps) =>
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const queryStringParameters =
        event.queryStringParameters as EventRecord["queryStringParameters"];
      const catalogName = queryStringParameters.name;
      const catalogPath = `uploaded/${catalogName}`;
      const url = await getSignedUrlPromise(s3, BUCKET, catalogPath, 60);

      return successResponse(url);
    } catch (error: any) {
      return errorResponse(error);
    }
  };
