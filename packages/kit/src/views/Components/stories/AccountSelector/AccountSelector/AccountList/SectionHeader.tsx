import React, { FC } from 'react';

import { Box, IconButton, Text } from '@onekeyhq/components';
import WalletAvatar from '@onekeyhq/kit/src/components/WalletSelector/WalletAvatar';

type SectionHeaderProps = {
  walletName?: string;
  emptySectionData?: boolean;
};

const defaultProps = {} as const;

const SectionHeader: FC<SectionHeaderProps> = ({
  walletName,
  emptySectionData,
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const AddAccountAction: FC<{}> = () => (
    <>
      <IconButton type="plain" name="PlusCircleSolid" circle />
    </>
  );

  return (
    <Box>
      <Box flexDirection="row" alignItems="center" mb={2} pl={2} pr={1.5}>
        <Box flex={1} flexDirection="row" alignItems="center" mr={3}>
          <WalletAvatar size="xs" />
          <Text ml={2} typography="Subheading" color="text-subdued" isTruncated>
            {walletName}
          </Text>
        </Box>
        <AddAccountAction />
      </Box>
      {emptySectionData ? <Box>No accounts inside</Box> : undefined}
    </Box>
  );
};

SectionHeader.defaultProps = defaultProps;

export default SectionHeader;
