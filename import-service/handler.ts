import * as handlers from "./src";
import { winstonLogger as logger } from "./src/utils/winstonLogger";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

const s3 = new S3Client({ region: "us-east-1" });
const sqs = new SQSClient({});

export const importFileParser = handlers.importFileParser({
  s3,
  sqs,
  logger,
});

export const importProductsFile = handlers.importProductsFile({
  s3,
});
