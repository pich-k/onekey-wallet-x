import { TokenSchema, WalletSchema } from '.';

import Realm from 'realm';

import {
  AccountType,
  DBAccount,
  DBSimpleAccount,
  DBUTXOAccount,
  DBVariantAccount,
} from '../../../types/account';

class AccountSchema extends Realm.Object {
  public id!: string;

  public name!: string;

  public type!: AccountType;

  public path?: string;

  public coinType!: string;

  public pub?: string;

  public xpub?: string;

  public address?: string;

  public addresses?: Realm.Dictionary<string>;

  public tokens?: Realm.Set<TokenSchema>;

  public assignee!: Realm.Results<WalletSchema>;

  public static schema: Realm.ObjectSchema = {
    name: 'Account',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      type: 'string',
      path: 'string?',
      coinType: 'string',
      pub: 'string?',
      xpub: 'string?',
      address: 'string?',
      addresses: { type: 'dictionary', default: {}, objectType: 'string' },
      tokens: { type: 'Token<>', default: [] },
      assignee: {
        type: 'linkingObjects',
        objectType: 'Wallet',
        property: 'accounts',
      },
    },
  };

  get internalObj(): DBAccount {
    const ret = {
      id: this.id,
      name: this.name,
      type: this.type,
      path: this.path || '',
      coinType: this.coinType,
      address: this.address || '',
    } as DBAccount;
    if (this.type === AccountType.SIMPLE) {
      (ret as DBSimpleAccount).pub = this.pub || '';
    } else if (this.type === AccountType.VARIANT) {
      (ret as DBVariantAccount).pub = this.pub || '';
      (ret as DBVariantAccount).addresses = this.addresses || {};
    } else if (this.type === AccountType.UTXO) {
      (ret as DBUTXOAccount).xpub = this.xpub || '';
      (ret as DBUTXOAccount).addresses = this.addresses || {};
    }
    return ret;
  }
}
export { AccountSchema };