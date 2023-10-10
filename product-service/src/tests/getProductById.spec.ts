import { describe, expect, test } from '@jest/globals';
import products from '@mocks/products.json';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSMockLambdaContext from 'aws-lambda-mock-context';
import { getProductById } from 'handler';




describe('Test getProductById lambda', () => {
  test('Recieves product by id Successfully', async () => {
    const event = {
      pathParameters: {
        productId: products[0].id,
      } as unknown,
    } as APIGatewayProxyEvent;

    const result = (await getProductById(
      event,
      AWSMockLambdaContext(),

    )) as APIGatewayProxyResult;

    const parsedResult = JSON.parse(result.body);
    console.log(result)

    expect(parsedResult).toBeDefined();
    expect(result.statusCode).toEqual(200);
  });

  test('Recieved error for unknown product Id', async () => {
    const event = {
      pathParameters: {
        id: 'mock-id',
      } as unknown,
    } as APIGatewayProxyEvent;

    const result = (await getProductById(
      event,
      AWSMockLambdaContext(),
   
    )) as APIGatewayProxyResult;

    const parsedResult = JSON.parse(result.body);

    expect(parsedResult?.message).toBeDefined();
    expect(result.statusCode).toEqual(404);
  });
});