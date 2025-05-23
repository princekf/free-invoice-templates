import { Currency } from "./currency.model";

  export interface DateFormat {
    name: string;
    value: string;
  }
  
  export interface Country {
    name: string;
    code: string;
    iso: string;
    currency: Currency;
    dateformat: DateFormat;
  }
  