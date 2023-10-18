import ProductService from "./src/services/product.service";
require("dotenv").config();

import * as handlers from "./src";
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
const dynamoDBClient = new DynamoDB({});
const client = DynamoDBDocument.from(dynamoDBClient);
const productService = new ProductService(client);
export const getProductById = handlers.getProductById(productService);
export const getProductsList = handlers.getProductsList(productService);
export const createProductHandler =
  handlers.createProductHandler(productService);
