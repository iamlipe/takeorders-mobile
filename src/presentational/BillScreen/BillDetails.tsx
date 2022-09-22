import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import styled, { useTheme } from 'styled-components/native';

import { useReduxDispatch } from '@hooks/useReduxDispatch';
import { useReduxSelector } from '@hooks/useReduxSelector';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BillStackParamList } from '@routes/stacks/BillStack';
import { Bill as BillModel } from '@database/models/billModel';
import { OrderUseCase } from '@database/useCase/orderUseCase';
import { useTranslation } from 'react-i18next';

import { GET_ORDERS, REMOVE_ORDER } from '@store/slices/orderSlice';

import emptyOrdersImg from '@assets/imgs/empty-orders.png';

import { StatusBar } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Dimensions, FlatList } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import Loading from '@components/Loading';
import Header from '@components/Header';
import Card from '@components/Card';
import formatedCurrency from '@utils/formatedCurrency';
import Button from '@components/Button';
import CloseBillBottomSheetModal from './CloseBillBottomSheetModal';

type StackParamsList = {
  Info: {
    bill: BillModel;
  };
};

type NavProps = NativeStackNavigationProp<BillStackParamList, 'BillAddProduct'>;

const { height } = Dimensions.get('window');

const heigthList = height - (120 + 32 + 32 + 16 + 16 + 32 + 98 + 32 + 72);

export const BillDetails = () => {
  const [showContent, setShowContent] = useState(false);
  const [totalPriceBill, setTotalPriceBill] = useState(0);

  const { allOrdersClient, isLoading } = useReduxSelector(state => state.order);
  const dispatch = useReduxDispatch();

  const isFocused = useIsFocused();
  const { bill } = useRoute<RouteProp<StackParamsList, 'Info'>>().params;
  const { goBack } = useNavigation();
  const { navigate } = useNavigation<NavProps>();

  const theme = useTheme();

  const { t } = useTranslation();

  const closeBillBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleShowcloseBillBottomSheet = useCallback(() => {
    closeBillBottomSheetModalRef.current?.present();
  }, []);

  const getOrders = useCallback(() => {
    dispatch(GET_ORDERS({ billId: bill.id }));
  }, [bill, dispatch]);

  const removeOrder = useCallback(
    async ({ orderId }: { orderId: string }) => {
      const order = await OrderUseCase.getById({ billId: bill.id, orderId });

      dispatch(REMOVE_ORDER({ order }));
    },
    [bill.id, dispatch],
  );

  useEffect(() => {
    getOrders();
  }, [getOrders, isFocused, isLoading]);

  useEffect(() => {
    if (allOrdersClient && !isLoading) {
      setTimeout(() => {
        setShowContent(true);
      }, 1000);
    }
  }, [allOrdersClient, isLoading]);

  useEffect(() => {
    if (allOrdersClient) {
      const totalPrice = allOrdersClient.reduce(
        (prev, curr) => prev + curr.product.price * curr.quantity,
        0,
      );

      setTotalPriceBill(totalPrice);
    }
  }, [allOrdersClient, isLoading]);

  const renderContent = () => {
    return (
      <>
        {showContent ? (
          <StyledContent>
            <StyledTitle>{t('screens.billDetails.title')}</StyledTitle>

            {allOrdersClient?.length ? (
              <FlatList
                data={allOrdersClient}
                renderItem={({ item }) => (
                  <Card
                    key={item.id}
                    type="normal"
                    cardSize="medium"
                    item={{
                      title: item.product.name,
                      image: item.product.image,
                      description: formatedCurrency(
                        item.product.price * item.quantity,
                      ),
                      quantity: String(item.quantity),
                      linkTitle: t('components.card.links.delete'),
                      link: () => {
                        removeOrder({ orderId: item.id });
                      },
                    }}
                    noTouchable
                    onPress={() => null}
                  />
                )}
                keyExtractor={item => item.id}
                style={{
                  height: StatusBar.currentHeight
                    ? heigthList - StatusBar.currentHeight
                    : heigthList,
                  marginVertical: 16,
                }}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <StyledContainerEmptyOrders>
                <StyledImageEmptyOrders source={emptyOrdersImg} />
                <StyledTextEmptyOrders>
                  {t('screens.billDetails.listOrdersEmpty')}
                </StyledTextEmptyOrders>
              </StyledContainerEmptyOrders>
            )}

            <StyledContainerInfoBill>
              <StyledTitleTotalPriceBill>
                {t('screens.billDetails.total').toUpperCase()}
              </StyledTitleTotalPriceBill>
              <StyledTotalPriceBill>
                {formatedCurrency(totalPriceBill)}
              </StyledTotalPriceBill>
            </StyledContainerInfoBill>

            <StyledContainerButtons>
              <Button
                title={t('components.button.addProductOrder')}
                onPress={() => navigate('BillAddProduct', { bill })}
                icon={{ name: 'add', color: 'GRAY_800' }}
                iconPosition="left"
                backgroundColor="trasparent"
                fontColor="GRAY_800"
              />
              <Button
                title={t('components.button.closeBill')}
                onPress={handleShowcloseBillBottomSheet}
              />
            </StyledContainerButtons>

            <CloseBillBottomSheetModal
              bill={bill}
              totalPriceBill={totalPriceBill}
              ref={closeBillBottomSheetModalRef}
            />
          </StyledContent>
        ) : (
          <Loading />
        )}
      </>
    );
  };

  return (
    <StyledContainer
      colors={[
        theme.colors.BACKGROUND_WEAKYELLOW,
        theme.colors.BACKGROUND_OFFWHITE,
      ]}
    >
      <Header
        title={
          bill.name[0].toUpperCase() + bill.name.substring(1).toLowerCase()
        }
        onPress={goBack}
      />

      {useMemo(renderContent, [
        allOrdersClient,
        bill,
        handleShowcloseBillBottomSheet,
        navigate,
        removeOrder,
        showContent,
        t,
        totalPriceBill,
      ])}
    </StyledContainer>
  );
};

const StyledContainer = styled(LinearGradient)`
  min-height: 100%;
`;

const StyledContent = styled.View`
  padding: 32px 0;
`;

const StyledContainerButtons = styled.View`
  height: 98px;

  justify-content: space-between;
`;

const StyledTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_REGULAR};
  font-size: ${({ theme }) => theme.sizing.MEDIUM};

  color: ${({ theme }) => theme.colors.GRAY_800};

  line-height: 32px;

  padding: 0 32px;
`;

const StyledContainerInfoBill = styled.View`
  height: 32px;

  flex-direction: row;

  justify-content: space-between;
  align-items: center;

  padding: 0 32px;
`;

const StyledTitleTotalPriceBill = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_REGULAR};
  font-size: ${({ theme }) => theme.sizing.SMALLER};

  color: ${({ theme }) => theme.colors.GRAY_800};
`;

const StyledTotalPriceBill = styled(StyledTitleTotalPriceBill)`
  font-family: ${({ theme }) => theme.fonts.HEEBO_MEDIUM};
`;

const StyledContainerEmptyOrders = styled.View`
  justify-content: center;
  align-items: center;

  height: ${heigthList}px;
`;

const StyledImageEmptyOrders = styled.Image`
  height: 120px;
  width: 120px;
`;

const StyledTextEmptyOrders = styled(StyledTitle)`
  font-size: ${({ theme }) => theme.sizing.SMALLEST};
`;
