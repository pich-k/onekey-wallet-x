import React, { FC, useCallback, useMemo } from 'react';

import { ListRenderItem, useWindowDimensions } from 'react-native';

import {
  Box,
  FlatList,
  Pressable,
  Typography,
  useIsVerticalLayout,
} from '@onekeyhq/components';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import DAppIcon from '../../DAppIcon';
import { DAppItemType } from '../../type';
import { SectionTitle } from '../TitleView';
import { SectionDataType } from '../type';

const CardViewMobile: FC<SectionDataType> = ({ title, data, onItemSelect }) => {
  const filterData = data.filter((item, index) => index < 8);

  const renderItem: ListRenderItem<DAppItemType> = useCallback(
    ({ item }) => (
      <Pressable
        onPress={() => {
          if (onItemSelect) {
            onItemSelect(item);
          }
        }}
      >
        <Box
          width="139px"
          height="100%"
          bgColor="surface-default"
          ml="16px"
          borderRadius="12px"
          padding="16px"
          alignItems="center"
          borderWidth={1}
          borderColor="border-subdued"
        >
          <DAppIcon size={48} favicon={item.favicon} chain={item.chain} />
          <Typography.Body2Strong numberOfLines={1} mt="12px">
            {item.name}
          </Typography.Body2Strong>
          <Typography.Caption
            numberOfLines={4}
            mt="4px"
            textAlign="center"
            color="text-subdued"
          >
            {item.subtitle}
          </Typography.Caption>
        </Box>
      </Pressable>
    ),
    [onItemSelect],
  );
  return (
    <Box width="100%" height="224px" mt="32px">
      <SectionTitle title={title} data={data} onItemSelect={onItemSelect} />
      <FlatList
        contentContainerStyle={{
          paddingRight: 16,
        }}
        showsHorizontalScrollIndicator={!platformEnv.isNative}
        horizontal
        data={filterData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `CardView${index}${item.id}`}
      />
    </Box>
  );
};

const CardViewDesktop: FC<SectionDataType> = ({
  title,
  data,
  onItemSelect,
}) => {
  const { width } = useWindowDimensions();
  const screenWidth = width - 270 - 48;
  const minWidth = 250;
  const numColumns = Math.floor(screenWidth / minWidth);
  const cardWidth = screenWidth / numColumns;
  const filterData = data.filter((item, index) => index < 8);

  const renderItem: ListRenderItem<DAppItemType> = useCallback(
    ({ item }) => (
      <Box
        width={cardWidth}
        maxWidth={cardWidth}
        minWidth={cardWidth}
        height={176}
        paddingX="8px"
        justifyContent="center"
        alignItems="center"
      >
        <Pressable
          bgColor="surface-default"
          flexDirection="column"
          borderRadius="12px"
          padding="16px"
          width={cardWidth - 16}
          height={164}
          borderWidth={1}
          _hover={{ bgColor: 'surface-hovered' }}
          borderColor="border-subdued"
          onPress={() => {
            if (onItemSelect) {
              onItemSelect(item);
            }
          }}
        >
          <DAppIcon size={48} favicon={item.favicon} chain={item.chain} />
          <Typography.Body2Strong numberOfLines={1} mt="12px">
            {item.name}
          </Typography.Body2Strong>
          <Typography.Caption
            numberOfLines={3}
            mt="4px"
            textAlign="left"
            color="text-subdued"
          >
            {item.subtitle}
          </Typography.Caption>
        </Pressable>
      </Box>
    ),
    [cardWidth, onItemSelect],
  );

  const flatList = useMemo(
    () => (
      <FlatList
        paddingLeft="24px"
        data={filterData}
        renderItem={renderItem}
        numColumns={numColumns}
        keyExtractor={(item, index) => `${numColumns}key${index}${item.id}`}
        key={`key${numColumns}`}
      />
    ),
    [filterData, numColumns, renderItem],
  );
  return (
    <Box width="100%" mt="32px">
      <SectionTitle title={title} data={data} onItemSelect={onItemSelect} />
      {flatList}
    </Box>
  );
};

const CardView: FC<SectionDataType> = ({ ...rest }) => {
  const isSmallScreen = useIsVerticalLayout();
  const { data } = rest;
  return isSmallScreen ? (
    <CardViewMobile {...rest} data={data} />
  ) : (
    <CardViewDesktop {...rest} data={data} />
  );
};

export default CardView;
