
import { describe, expect, test } from '@jest/globals';
import products from '@mocks/products.json';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWSMockLambdaContext from 'aws-lambda-mock-context';
import { getProductsList } from 'handler';

describe('Test getProductsList lambda', () => {
  test('Returns mock products list', async () => {
    const event = {} as APIGatewayProxyEvent;
    const result = (await getProductsList(
      event,
      AWSMockLambdaContext(),

    )) as APIGatewayProxyResult;

    const parsedResult = JSON.parse(result.body);
    expect(parsedResult).toStrictEqual(products);
    expect(result.statusCode).toEqual(200);
  });
});