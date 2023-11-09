import {
  EventRecord,
  ImportProductsFileProps,
  importProductsFile,
} from "../importProductsFile"; // Update this import path accordingly
import { AWSError, S3 } from "aws-sdk";
import * as apiResponseBuilder from "../utils/apiResponseBuilder"; // Update this import path accordingly
import AWSMock from "aws-sdk-mock";
import { expect, test, jest } from "@jest/globals";

interface CustomGetSignedUrlRequest {
  Bucket: string;
  Key: string;
  /* other properties if needed */
}

test("importProductsFile Lambda Function - should return a pre-signed URL when provided with valid input", async () => {
  // Mock S3 methods

  AWSMock.mock(
    "S3",
    "getSignedUrlPromise",
    (
      params: CustomGetSignedUrlRequest,
      callback: (error: AWSError | null, url: string) => void
    ) => {
      // Mock the behavior of the getSignedUrlPromise method
      callback(null, `https://mocked-s3-url/${params.Key}`);
    }
  );

  // Arrange
  const queryStringParameters = { name: "test.csv" };
  const event = {
    queryStringParameters: queryStringParameters,
  };

  // Mock successResponse from apiResponseBuilder
  const successResponseStub = jest.spyOn(apiResponseBuilder, "successResponse");
  successResponseStub.mockImplementation((url: any) => {
    expect(url).toEqual("https://mocked-s3-url/uploaded/example.csv"); // Ensure the URL matches the expected result
    return { statusCode: 200, body: JSON.stringify({ url }) };
  });

  // Act
  const result = await importProductsFile({} as )(event);

  // Assert
  expect(result.statusCode).toEqual(200);
  expect(successResponseStub).toHaveBeenCalled();

  // Restore AWS SDK methods after the test
  AWSMock.restore("S3");
});

test("importProductsFile Lambda Function - should return an error response when provided with invalid input", async () => {
  // Arrange
  const event = {
    queryStringParameters: null, // Invalid input, no queryStringParameters provided
  };

  // Mock errorResponse from apiResponseBuilder
  const errorResponseStub = jest.spyOn(apiResponseBuilder, "errorResponse");
  errorResponseStub.mockImplementation((error:any) => {
    // You can customize your error response validation here if needed
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  });

  // Act
  const result = await importProductsFile({} as S3)(event);

  // Assert
  expect(result.statusCode).toEqual(500);
  expect(errorResponseStub).toHaveBeenCalled();
});
