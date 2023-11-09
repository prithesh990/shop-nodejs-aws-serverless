import { winstonLogger } from "./utils/winstonLogger";
import {
  ResponseInterface,
  errorResponse,
  successResponse,
} from "./utils/apiResponseBuilder";
import ProductService from "./services/product.service";
import { ProductInterface } from "./services/products";

export const getProductsList =
  (productService: ProductService) => async (event: any, _context: any) => {
    try {
      const products: ProductInterface[] =
        await productService.getAllProducts();
      return successResponse(products);
    } catch (err: any) {
      winstonLogger.logRequest(`"Error occured: ${JSON.stringify(err)}`);
      return errorResponse(err);
    }
  };
