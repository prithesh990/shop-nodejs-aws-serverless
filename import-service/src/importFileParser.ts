import csv from "csv-parser";
import { S3, SQS } from "aws-sdk";
import util from "util";
import stream from "stream";
import { LoggerInterface } from "./utils/winstonLogger";
import { error } from "console";

const BUCKET: string = process.env.BUCKET || "";
const finished = util.promisify(stream.finished);

interface EventRecord {
  s3: {
    object: {
      key: string;
    };
  };
}

interface ImportFileParserProps {
  s3: S3;
  sqs: SQS;
  logger: LoggerInterface;
}

export const importFileParser =
  ({ s3, sqs, logger }: ImportFileParserProps) =>
  async (event: any) => {
    const results: any = [];
    for (const record of event.Records) {
      const fileName = record.s3.object.key;
      const s3Stream = s3
        .getObject({
          Bucket: BUCKET,
          Key: record.s3.object.key,
        })
        .createReadStream();

      await finished(
        s3Stream
          .pipe(csv())
          .on("data", (data: any) => {
            // logger.logRequest(JSON.stringify(data));

            results.push(data);
          })
          .on("end", async () => {
            logger.logRequest(`Copy from ${BUCKET}/${record.s3.object.key}`);
            const destinationKey = record.s3.object.key.replace(
              "uploaded",
              "parsed"
            );

            // Copy the object to the parsed folder
            await s3
              .copyObject({
                Bucket: BUCKET,
                CopySource: `${BUCKET}/${record.s3.object.key}`,
                Key: destinationKey,
              })
              .promise();

            logger.logRequest(`Copied into ${BUCKET}/${destinationKey}`);

            // Delete the object from the uploaded folder

            await s3
              .deleteObject({
                Bucket: BUCKET,
                Key: record.s3.object.key,
              })
              .promise();
            logger.logRequest(`Deleted from ${BUCKET}/${record.s3.object.key}`);

            results.forEach((item: any) => {
              sqs.sendMessage(
                {
                  QueueUrl: process.env.SQS_URL || "",
                  MessageBody: JSON.stringify(item),
                },
                (error, data) => {
                  if (error) {
                    logger.logError(`Error for send to SQS: ${error}`);
                  } else {
                    logger.logRequest(`Message was sent to SQS: ${data}`);
                  }
                }
              );
            });
          })
      );
    }
  };
