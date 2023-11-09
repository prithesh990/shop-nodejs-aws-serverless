import csv from "csv-parser";

import { LoggerInterface } from "./utils/winstonLogger";
import {
  getS3ObjectStream,
  moveS3Objects,
  sqsSendMessage,
} from "./utils/helper";

import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";
const parser = csv({ separator: "," });
interface ImportFileParserProps {
  s3: S3Client;
  sqs: SQSClient;
  logger: LoggerInterface;
}

export const importFileParser =
  ({ s3, sqs, logger }: ImportFileParserProps) =>
  async (event: any) => {
    try {
      const BUCKET = event.Records[0].s3.bucket.name;
      const encodedKey = event.Records[0].s3.object.key.replace(/\+/g, " ");
      const key = decodeURIComponent(encodedKey);
      const params = {
        QueueName: process.env.SQS_URL?.split(":").pop(), // Extracts the queue name from the ARN
      };
      const command = new GetQueueUrlCommand(params);
      const data = await sqs.send(command);
      const queueUrl = data.QueueUrl;
      const s3Stream = await getS3ObjectStream(s3, BUCKET, key);

      s3Stream
        .pipe(parser)
        .on("data", async (data: any) => {
          const messageBody = JSON.stringify(data);
          console.log(queueUrl);
          if (messageBody) {
            await sqsSendMessage(sqs, queueUrl, messageBody, logger);
          } else {
            console.log("Recived empty jsonData");
          }
        })

        .on("end", async () => {
          const [folder, filename] = encodedKey.split("/");
          await moveS3Objects(
            s3,
            BUCKET,
            folder,
            "parsed",
            decodeURIComponent(filename)
          );
        })
        .on("error", (error: any) => {
          console.error("Error reading CSV file:", error.message);
        });
    } catch (err) {
      console.log(err);
    }
  };
