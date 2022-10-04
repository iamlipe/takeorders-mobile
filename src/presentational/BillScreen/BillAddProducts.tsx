import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components/native';

import formatedCurrency from '@utils/formatedCurrency';

import { Product as ProductModel } from '@database/models/productModel';
import { Bill as BillModel } from '@database/models/billModel';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useReduxDispatch } from '@hooks/useReduxDispatch';
import { useReduxSelector } from '@hooks/useReduxSelector';
import { useTranslation } from 'react-i18next';
import { StackActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoggedStackParamList } from '@routes/stacks/LoggedStack';

import { GET_ALL_PRODUCTS } from '@store/slices/productSlice';

import EmptyProductsInStock from '@assets/svgs/empty-products-in-stock.svg';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Dimensions, FlatList, StatusBar } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import AddOrderBottomSheetModal from './AddOrderBottomSheetModal';
import SquareCard from '@components/SquareCard';
import Header from '@components/Header';
import Button from '@components/Button';
import SearchInput from '@components/SearchInput';
import Loading from '@components/Loading';

type StackParamsList = {
  Info: {
    bill: BillModel;
  };
};

type NavProps = NativeStackNavigationProp<LoggedStackParamList, 'StockStack'>;

const { height } = Dimensions.get('window');

export const BillAddProduct = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    null,
  );
  const [showContent, setShowContent] = useState(false);

  const dispatch = useReduxDispatch();

  const { stockId } = useReduxSelector(state => state.stock);
  const { allProducts, foundProducts, isLoading } = useReduxSelector(
    state => state.product,
  );

  const { bill } = useRoute<RouteProp<StackParamsList, 'Info'>>().params;

  const { navigate } = useNavigation<NavProps>();
  const { goBack, dispatch: navigateDispatch } = useNavigation();

  const heightList = useMemo(() => height - 120 - 32 - 56 - 24 - 72, []);

  const { t } = useTranslation();

  const theme = useTheme();

  const pushAction = StackActions.push('StockRegisterProduct', undefined);

  const addOrderBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleShowAddOrderBottomSheet = useCallback(() => {
    addOrderBottomSheetModalRef.current?.present();
  }, []);

  const handleColseAddOrderBottomSheet = useCallback(() => {
    addOrderBottomSheetModalRef.current?.dismiss();
  }, []);

  const getProducts = useCallback(() => {
    dispatch(GET_ALL_PRODUCTS());
  }, [dispatch]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  useEffect(() => {
    if (allProducts && !isLoading) {
      setTimeout(() => {
        setShowContent(true);
      }, 1000);
    }
  }, [allProducts, isLoading]);

  const renderContent = () => {
    const filteredProducts = allProducts?.filter(item => item.quantity > 0);

    if (showContent && filteredProducts?.length) {
      return (
        <StyledContainerProducts>
          <SearchInput
            placeholder={t('components.searchInput.product')}
            type="products"
          />

          <FlatList
            data={
              foundProducts && foundProducts.length
                ? foundProducts
                : filteredProducts
            }
            numColumns={2}
            renderItem={({ item }) => {
              return (
                <SquareCard
                  key={item.id}
                  item={{
                    name: item.name,
                    image: item.image,
                    price: formatedCurrency(item.price),
                  }}
                  onPress={() => {
                    setSelectedProduct(item);
                    handleShowAddOrderBottomSheet();
                  }}
                />
              );
            }}
            keyExtractor={item => item.id}
            style={{
              height: StatusBar.currentHeight
                ? heightList - StatusBar.currentHeight
                : heightList,
              marginTop: 16,
            }}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 32,
            }}
            showsVerticalScrollIndicator={false}
          />
        </StyledContainerProducts>
      );
    }

    if (showContent && allProducts?.length && !filteredProducts?.length) {
      return (
        <StyledContainerNoProductsInStock>
          <EmptyProductsInStock width={132} height={132} />
          <StyledTextNoProductsInStock>
            Todos produtos do estoque está em falta
          </StyledTextNoProductsInStock>
        </StyledContainerNoProductsInStock>
      );
    }

    if (showContent && !allProducts?.length) {
      return (
        <StyledContainerNoProductsRegistredInStock>
          <StyledTitleNoProductsRegistredInStock>
            {t('screens.billAddProducts.listProductsStockEmpty')}
          </StyledTitleNoProductsRegistredInStock>
          <Button
            title={t('components.button.addProductStock')}
            onPress={() => {
              navigate('StockStack');
              setTimeout(() => navigateDispatch(pushAction), 1000);
            }}
          />
        </StyledContainerNoProductsRegistredInStock>
      );
    }

    return <Loading />;
  };

  return (
    <StyledContainer
      colors={[
        theme.colors.BACKGROUND_WEAKYELLOW,
        theme.colors.BACKGROUND_OFFWHITE,
      ]}
    >
      <Header title={t('components.header.billAddProducts')} onPress={goBack} />

      {useMemo(renderContent, [
        allProducts,
        foundProducts,
        handleShowAddOrderBottomSheet,
        heightList,
        navigate,
        navigateDispatch,
        pushAction,
        showContent,
        t,
      ])}

      <AddOrderBottomSheetModal
        product={selectedProduct}
        billId={bill.id}
        closeBottomSheet={handleColseAddOrderBottomSheet}
        ref={addOrderBottomSheetModalRef}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(LinearGradient)`
  min-height: 100%;
`;

const StyledContainerProducts = styled.View`
  padding: 32px 0;
`;

const StyledContainerNoProductsRegistredInStock = styled.View`
  align-items: center;
  justify-content: center;

  padding: 64px 32px;
`;

const StyledTitleNoProductsRegistredInStock = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_MEDIUM};
  font-size: ${({ theme }) => theme.sizing.SMALLEST};

  text-align: center;

  margin-bottom: 16px;
`;

const StyledContainerNoProductsInStock = styled.View`
  height: ${StatusBar.currentHeight
    ? height - StatusBar.currentHeight - 120 - 72
    : height - 120 - 72}px;

  justify-content: center;
  align-items: center;

  margin-top: -32px;
`;

const StyledTextNoProductsInStock = styled.Text`
  width: 80%;

  font-family: ${({ theme }) => theme.fonts.HEEBO_REGULAR};
  font-size: ${({ theme }) => theme.sizing.SMALLEST};

  color: ${({ theme }) => theme.colors.GRAY_800};

  text-align: center;
`;
