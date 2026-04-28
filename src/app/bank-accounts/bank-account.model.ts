import { Bank } from "../banks/bank.model";
import { BankAccountType } from "../bank-account-types/bank-account-type.model";

export class BankAccount {
  id: number;
  name: string;
  agency: string;
  account_number: string;
  bank_account_type?: BankAccountType;
  bank: Bank;
}
