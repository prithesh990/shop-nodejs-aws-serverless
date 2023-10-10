import { getProductById as getProductByIdService } from "./services/products";
import { winstonLogger } from "./utils/winstonLogger";
import { errorResponse, successResponse, ResponseInterface } from "./utils/apiResponseBuilder";

export const getProductById: (event:any, _context:any) => Promise<ResponseInterface> = async (event, _context) => {
    try {
        winstonLogger.logRequest(`Incoming event: ${ JSON.stringify( event ) }`);

        const { productId = '' } = event.pathParameters;

        const product = getProductByIdService( productId );

        winstonLogger.logRequest(`"Received product with id: ${ productId }: ${ JSON.stringify( product ) }`);
        
        if( product )
            return successResponse( product  );


        return successResponse( { message: "Product not found!!!" }, 404 );
    }
    catch ( err:any ) {
        return errorResponse( err );
    }
}