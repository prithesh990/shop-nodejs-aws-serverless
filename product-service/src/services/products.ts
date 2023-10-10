
import products from '../mocks/products.json';

export interface ProductInterface {
    id: string,
    title: string,
    description: string,
    price: number,
    logo: string,
    count: number
}

export const getProductById = (id: string): ProductInterface | undefined => {
    const foundProduct = products.find(product => product.id === id);
    return foundProduct; // This can be either a ProductInterface or undefined
};
export const getAllProducts = (): ProductInterface[] => products;
