const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { v4: uuid } = require("uuid");

const items = require("./../mocks/products.json");
const loadEnvVariables = require("../../configs");

async function autoFill() {
  const mergedEnvVariables = await loadEnvVariables();

  const client = new DynamoDB({ region: "us-east-1" });
  const ddbDocClient = DynamoDBDocument.from(client);

  const Products = [];
  const Stocks = [];

  items.forEach((item) => {
    const id = uuid();

    Products.push({
      id,
      title: item.title,
      description: item.description,
      price: item.price,
      logo: item.logo,
    });

    Stocks.push({
      product_id: id,
      count: item.count,
    });
  });

  Products.forEach(async (product) => {
    await ddbDocClient.put({
      TableName: mergedEnvVariables.PRODUCT_TABLE,
      Item: product,
    });
  });

  Stocks.forEach(async (stock) => {
    await ddbDocClient.put({
      TableName: mergedEnvVariables.STOCKS_TABLE,
      Item: stock,
    });
  });

  ddbDocClient.destroy();
  client.destroy();

  console.log("Tables populated");
}

autoFill();
