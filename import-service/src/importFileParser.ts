import csv from "csv-parser";
import { S3 } from "aws-sdk";

const BUCKET: string = process.env.BUCKET || "";

interface EventRecord {
  s3: {
    object: {
      key: string;
    };
  };
}

interface ImportFileParserProps {
  s3: S3;
  logger: any;
}

export const importFileParser =
  ({ s3: S3Handler, logger }: ImportFileParserProps) =>
  async (event: { Records: EventRecord[] }) => {
    event.Records.forEach(async (record: EventRecord) => {
      const s3Stream = S3Handler.getObject({
        Bucket: BUCKET,
        Key: record.s3.object.key,
      }).createReadStream();

      s3Stream
        .pipe(csv())
        .on("data", (data: any) => {
          logger.log(JSON.stringify(data));
        })
        .on("end", async () => {
          logger.log(`Copy from ${BUCKET}/${record.s3.object.key}`);

          await S3Handler.copyObject({
            Bucket: BUCKET,
            CopySource: `${BUCKET}/${record.s3.object.key}`,
            Key: record.s3.object.key.replace("uploaded", "parsed"),
          }).promise();

          logger.log(
            `Copied into ${BUCKET}/${record.s3.object.key.replace(
              "uploaded",
              "parsed"
            )}`
          );
        });
    });
  };
