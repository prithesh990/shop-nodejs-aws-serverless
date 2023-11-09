import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SQS, SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const moveS3Objects = async (
  s3: any,
  bucketName: string,
  sourceFolder: string,
  destinationFolder: string,
  objectToMoveKey: string
) => {
  const sourceObjectKey = `${sourceFolder}/${objectToMoveKey}`;
  const destinationObjectKey = `${destinationFolder}/${objectToMoveKey}`;

  const copyObjectParams = {
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceObjectKey}`,
    Key: destinationObjectKey,
  };

  try {
    await s3.send(new CopyObjectCommand(copyObjectParams));

    const deleteObjectParams = {
      Bucket: bucketName,
      Key: sourceObjectKey,
    };

    await s3.send(new DeleteObjectCommand(deleteObjectParams));
  } catch (error) {
    console.error(
      `Error moving ${sourceObjectKey}: ${(error as Error).message}`
    );
  }
};

export const getSignedUrlPromise = (
  client: S3Client,
  bucket: string,
  key: string,
  expiresIn: number
) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  // expired in 60 seconds
  return getSignedUrl(client, command, {
    expiresIn,
  });
};

export const getS3ObjectStream = async (
  s3: any,
  Bucket: string,
  Key: string
) => {
  const params = {
    Bucket,
    Key,
  };
  const command = new GetObjectCommand(params);
  const response = await s3.send(command);

  const body = await response.Body;

  return body;
};

export const sqsSendMessage = async (
  sqs: SQSClient,
  sqsQueueUrl: any,
  body: string,
  logger: any
) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: sqsQueueUrl,
      MessageBody: body,
    });

    const response = await sqs.send(command);
    console.log(response);
    return response;
  } catch (error) {
    logger.logError(
      `Error sending sqs message URL: ${sqsQueueUrl} | ${
        (error as Error).message
      }`
    );
    // Ensure a resolved promise is returned even in case of error
    return Promise.reject(error);
  }
};
