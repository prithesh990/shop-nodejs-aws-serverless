import { ProductServiceInterface } from "./services/products";
import { winstonLogger } from "./utils/winstonLogger";
import { SNS } from "@aws-sdk/client-sns";

const sns = new SNS();

export const catalogBatchProcess =
  (productService: ProductServiceInterface) =>
  async (event: any, _context: any) => {
    try {
      for (const record of event.Records) {
        winstonLogger.logRequest(
          `Start processing record: ${JSON.parse(record.body)}`
        );

        const product = await productService.createProduct(
          JSON.parse(record.body)
        );

        winstonLogger.logRequest(`Created product: ${JSON.stringify(product)}`);

        if (product.id) {
          sns.publish(
            {
              Subject: "New product created",
              Message: JSON.stringify(product),
              MessageAttributes: {
                title: {
                  DataType: "String",
                  StringValue: product.title,
                },
              },
              TopicArn: process.env.SNS_ARN,
            },
            (error, data: any) => {
              if (error) {
                winstonLogger.logError(
                  `Failed to send SNS notification: ${error}`
                );
              } else {
                winstonLogger.logRequest(
                  `SNS notification was sent for ${data.title}`
                );
              }
            }
          );
        }
      }

      return {
        statusCode: 202,
      };
    } catch (err) {
      winstonLogger.logError(`Failed to process batch request: ${err}`);
    }
  };
