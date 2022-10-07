import { IClientMeta, ISessionStatus } from '@walletconnect/types';
import { merge } from 'lodash';

import { IMPL_EVM } from '@onekeyhq/engine/src/constants';
import debugLogger from '@onekeyhq/shared/src/logger/debugLogger';

import { backgroundMethod } from '../../background/decorators';
import { wait } from '../../utils/helper';

import { OneKeyWalletConnector } from './OneKeyWalletConnector';
import {
  IWalletConnectClientOptions,
  WalletConnectClientBase,
} from './WalletConnectClient';
import { WALLET_CONNECT_CLIENT_META } from './walletConnectConsts';
import { WalletConnectSessionStorage } from './WalletConnectSessionStorage';

const sessionStorage = new WalletConnectSessionStorage({
  storageId: WalletConnectSessionStorage.STORAGE_IDS.WALLET_SIDE,
});

const clientMeta: IClientMeta = WALLET_CONNECT_CLIENT_META;

export abstract class WalletConnectClientForWallet extends WalletConnectClientBase {
  override isWalletSide = true;

  constructor(props?: IWalletConnectClientOptions) {
    super(
      merge(
        {
          sessionStorage,
          clientMeta,
        },
        props,
      ),
    );
    (async () => {
      // ** do not disconnect previous session
      // await this.disconnect();

      // ** auto connect previous session
      await this.autoConnectLastSession();
    })();
  }

  abstract getSessionStatusToApprove(options: {
    connector?: OneKeyWalletConnector;
  }): Promise<ISessionStatus>;

  previousUri: string | undefined;

  // TODO connecting check, thread lock
  // connectToDapp
  @backgroundMethod()
  async connect({ uri }: { uri: string }) {
    // eslint-disable-next-line no-param-reassign
    uri = uri?.trim() || uri;
    // uri network param defaults to evm
    const network = new URL(uri).searchParams.get('network') || IMPL_EVM;

    if (this.previousUri && this.previousUri === uri) {
      await wait(1500);
      throw new Error('WalletConnect ERROR: uri is expired');
    }
    this.previousUri = uri;

    const connector = await this.createConnector(
      {
        uri,
      },
      {
        shouldDisconnectStorageSession: true,
      },
    );

    // TODO convert url to origin
    const origin = this.getConnectorOrigin(connector);
    debugLogger.walletConnect.info('new WalletConnect() by uri', {
      origin,
      network,
      uri,
    });

    // TODO on('connect') fired on peerId ready or approveSession()?

    // TODO show loading in UI

    // TODO check dapp is EVM or Solana
    //    connector.session
    //    connector.uri
    try {
      const sessionStatus = await this.getSessionStatusToApprove({
        connector,
      });
      if (connector.connected) {
        debugLogger.walletConnect.info(
          'walletConnect.connect -> updateSession',
          sessionStatus,
        );
        connector.updateSession(sessionStatus);
      } else {
        const doApproveSession = () => {
          debugLogger.walletConnect.info(
            'walletConnect.connect -> approveSession',
            sessionStatus,
          );
          connector.approveSession(sessionStatus);
        };
        doApproveSession();
        // setTimeout(doApproveSession, 2000);// throw error if connected already
      }
    } catch (error) {
      debugLogger.walletConnect.info(
        'walletConnect.connect -> rejectSession',
        error,
      );
      connector.rejectSession(error as any);
    } finally {
      await wait(600);
    }
  }
}
