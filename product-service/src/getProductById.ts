import { winstonLogger } from "./utils/winstonLogger";
import {
  errorResponse,
  successResponse,
  ResponseInterface,
} from "./utils/apiResponseBuilder";
import ProductService from "./services/product.service";

export const getProductById =
  (productService: ProductService) => async (event: any, _context: any) => {
    try {
      const { productId = "" } = event.pathParameters;

      const product = await productService.getProductById(productId);

      if (product) return successResponse(product);

      return successResponse({ message: "Product not found!!!" }, 404);
    } catch (err: any) {
      winstonLogger.logRequest(`"Error occured: ${JSON.stringify(err)}`);
      return errorResponse(err);
    }
  };
