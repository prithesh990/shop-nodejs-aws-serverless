import { winstonLogger } from "./utils/winstonLogger";
import { errorResponse, successResponse } from "./utils/apiResponseBuilder";
import ProductService from "./services/product.service";

export const createProductHandler =
  (productService: ProductService) => async (event: any, _context: any) => {
    try {
      const product = await productService.createProduct(
        JSON.parse(event.body)
      );

      winstonLogger.logRequest(`Created product: ${JSON.stringify(product)}`);
      return successResponse(product);
    } catch (err: any) {
      winstonLogger.logRequest(`"Error occured: ${JSON.stringify(err)}`);
      return errorResponse(err);
    }
  };
