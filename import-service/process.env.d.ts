declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PRODUCT_TABLE: string;
      STOCKS_TABLE: string;
    }
  }
}
