import axios from 'axios';
import qs from 'qs';

import { ServerToken, Token } from '@onekeyhq/kit/src/store/typings';
import debugLogger from '@onekeyhq/shared/src/logger/debugLogger';

import { IMPL_SOL, IMPL_STC, IMPL_TRON, SEPERATOR } from '../constants';
import { getFiatEndpoint, getGitEndpoint } from '../endpoint';
import { OneKeyInternalError } from '../errors';

export type TokenQuery = {
  // for all chain search
  impl?: string;
  chainId?: string;

  query?: string;
  // v3.12+
  includeNativeToken?: 0 | 1;
};

export type TokenSource = {
  name: string;
  logo: string;
  count: number;
};

export type TokenDetailQuery = {
  impl: string;
  chainId: string;
  address: string;
};

export const caseSensitiveImpls = new Set([IMPL_SOL, IMPL_STC, IMPL_TRON]);

let cachedTokenSourceList: TokenSource[] = [];

const taskPool: Map<string, Promise<any>> = new Map();

function getNetworkIdFromTokenId(tokenId: string): string {
  const [impl, chainId, tokenIdOnNetwork] = tokenId.split(SEPERATOR);
  if (impl && chainId && tokenIdOnNetwork) {
    return `${impl}${SEPERATOR}${chainId}`;
  }
  throw new OneKeyInternalError(`Invalid tokenId ${tokenId}.`);
}

export const formatServerToken = (token: ServerToken) => {
  const { address = '', logoURI, isNative } = token;
  const { impl, chainId } = token;
  let tokenAddress = address;
  if (impl) {
    tokenAddress = caseSensitiveImpls.has(impl)
      ? address
      : address.toLowerCase();
  }
  const networkId = `${impl}--${chainId}`;
  return {
    ...token,
    id: isNative ? networkId : `${networkId}--${tokenAddress}`,
    networkId,
    logoURI: logoURI || '',
    tokenIdOnNetwork: tokenAddress,
    address: tokenAddress,
  };
};

async function doFetch<T>(url: string, fallback: T) {
  try {
    const { data } = await axios.get<T>(url);
    return data;
  } catch (error) {
    debugLogger.common.error(`fetch ${url} error`);
    return fallback;
  }
}

async function fetchData<T>(
  path: string,
  query: Record<string, unknown> = {},
  fallback: T,
): Promise<T> {
  let endpoint = getFiatEndpoint();
  let apiUrl = `${endpoint}${path}?${qs.stringify(query)}`;

  if(query.impl == 'evm' && ['96', '3501'].includes(String(query.chainId))){
    endpoint = getGitEndpoint();
    apiUrl = `${endpoint}/token-${String(query.chainId)}.json`;
  }

  let task: Promise<T> | undefined = taskPool.get(apiUrl);
  if (task) {
    return task.finally(() => {
      taskPool.delete(apiUrl);
    });
  }
  task = doFetch(apiUrl, fallback);
  taskPool.set(apiUrl, task);
  return task;
}

export const checkTokenUpdate = async (timestamp: number): Promise<boolean> =>
  fetchData(
    '/token/check-update',
    {
      timestamp,
    },
    false,
  );

export const fetchOnlineTokens = async (
  params: TokenQuery,
): Promise<ServerToken[]> => {
  const { chainId, impl, query, includeNativeToken = 1 } = params;
  const search = {
    impl,
    chainId,
    includeNativeToken,
  };
  if (query) {
    Object.assign(search, { query });
  }
  return fetchData('/token/list', search, []);
};

export const fetchTokenSource = async (): Promise<TokenSource[]> => {
  if (cachedTokenSourceList.length) {
    return cachedTokenSourceList;
  }
  const data = await fetchData('/token/source', {}, []);
  cachedTokenSourceList = data;
  return data;
};

export const fetchTokenDetail = async (
  params: TokenDetailQuery,
): Promise<Token | undefined> => {
  const { impl, chainId, address } = params;
  return fetchData(
    '/token/detail',
    {
      impl,
      chainId: String(chainId),
      address,
    },
    undefined,
  );
};

export { getNetworkIdFromTokenId };
