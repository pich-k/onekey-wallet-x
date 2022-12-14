import { COINTYPE_SOL as COIN_TYPE } from '../../../constants';
import { InvalidAddress } from '../../../errors';
import { AccountType, DBSimpleAccount } from '../../../types/account';
import { KeyringWatchingBase } from '../../keyring/KeyringWatchingBase';

import type { IPrepareWatchingAccountsParams } from '../../types';

export class KeyringWatching extends KeyringWatchingBase {
  override async prepareAccounts(
    params: IPrepareWatchingAccountsParams,
  ): Promise<Array<DBSimpleAccount>> {
    const { name, target } = params;
    const { normalizedAddress, isValid } =
      await this.engine.providerManager.verifyAddress(this.networkId, target);
    if (!isValid || typeof normalizedAddress === 'undefined') {
      throw new InvalidAddress();
    }

    return Promise.resolve([
      {
        id: `watching--${COIN_TYPE}--${target}`,
        name: name || '',
        type: AccountType.SIMPLE,
        path: '',
        coinType: COIN_TYPE,
        pub: normalizedAddress, // bs58 encoded
        address: normalizedAddress,
      },
    ]);
  }
}
