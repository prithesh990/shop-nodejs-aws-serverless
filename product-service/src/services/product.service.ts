import { ProductServiceInterface, ProductInterface } from "./products";
const { DynamoDB, ScanCommand } = require("@aws-sdk/client-dynamodb");
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");
const { v4: uuid } = require("uuid");
const yup = require("yup");
class ProductService implements ProductServiceInterface {
  constructor(private client: DynamoDBDocument) {}

  private async isPostValid(
    product: ProductInterface
  ): Promise<ProductInterface | any> {
    try {
      const productSchema = yup.object({
        title: yup.string().required(),
        description: yup.string().required(),
        price: yup.number().integer().positive().required(),
        count: yup.number().integer().positive().required(),
      });

      await productSchema.validate(product, { abortEarly: false });

      return product;
    } catch (error: any) {
      throw new Error(error.errors.join(", "));
    }
  }
  private getItemFromTable = async (TableName: string | undefined) => {
    const scanItems: any = await this.client.send(
      new ScanCommand({
        TableName,
        ConsistentRead: true,
      })
    );
    return scanItems.Items.map((item: any) => unmarshall(item));
  };

  private getItemFromTableByKey = async (
    TableName: string | undefined,
    Key: Record<string, any> | undefined
  ) => {
    const response = await this.client.get({
      TableName,
      Key,
    });
    return response.Item;
  };

  async createProduct(
    product: Pick<
      ProductInterface,
      "title" | "description" | "price" | "logo" | "count"
    >
  ): Promise<any> {
    try {
      const { count, ...rest } = await this.isPostValid(product);
      const id = uuid();

      await this.client.transactWrite({
        TransactItems: [
          {
            Put: {
              Item: {
                ...rest,
                id,
              },
              TableName: process.env.PRODUCT_TABLE,
            },
          },
          {
            Put: {
              Item: {
                product_id: id,
                count,
              },
              TableName: process.env.STOCKS_TABLE,
            },
          },
        ],
      });

      return "Product created Successfully";
    } catch (error: any) {
      // Handle validation errors returned from isPostValid
      return { error: error.message };
    }
  }

  async getProductById(id: string): Promise<ProductInterface | any> {
    try {
      const productResponse = await this.getItemFromTableByKey(
        process.env.PRODUCT_TABLE,
        { id }
      );

      const stocksResponse = await this.getItemFromTableByKey(
        process.env.STOCKS_TABLE,
        {
          product_id: id,
        }
      );

      return {
        ...productResponse,
        count: stocksResponse ? stocksResponse.count : 0,
      };
    } catch (e) {
      return {
        statusCode: 500,
        body: {
          message: "Failed to find products",
        },
      };
    }
  }
  async getAllProducts(): Promise<any> {
    try {
      const productResponse = await this.getItemFromTable(
        process.env.PRODUCT_TABLE
      );
      const stocksResponse = await this.getItemFromTable(
        process.env.STOCKS_TABLE
      );

      const result: ProductInterface[] = productResponse.map((product: any) => {
        const stocksInfo = stocksResponse.find(
          (item: any) => item.product_id === product.id
        );

        return {
          ...product,
          count: stocksInfo ? stocksInfo.count : 0,
        };
      });
      return result;
    } catch (e: any) {
      return {
        body: e?.message || "Something went wrong !!",
      };
    }
  }
}

export default ProductService;
