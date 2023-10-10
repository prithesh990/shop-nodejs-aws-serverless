import { ProductInterface, getAllProducts } from "./services/products";
import { winstonLogger } from "./utils/winstonLogger";
import { ResponseInterface, errorResponse, successResponse } from "./utils/apiResponseBuilder";



export const getProductsList: ( event:any, _context:any ) => Promise<ResponseInterface>  = async (event, _context) => {
    try {
        winstonLogger.logRequest(`Incoming event: ${ JSON.stringify( event ) }`);

        const products:ProductInterface[] = getAllProducts()

        winstonLogger.logRequest(`"Received products: ${ JSON.stringify( products ) }`);

        return successResponse(
           products,
        );
    } 
    catch (err:any) {
        return errorResponse( err );
    }
}
