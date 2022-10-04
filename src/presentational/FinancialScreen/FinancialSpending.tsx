import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styled, { useTheme } from 'styled-components/native';

import { Purchase as PurchaseModel } from '@database/models/purchaseModel';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useReduxDispatch } from '@hooks/useReduxDispatch';
import { useReduxSelector } from '@hooks/useReduxSelector';
import { useTranslation } from 'react-i18next';

import { GET_PURCHASES } from '@store/slices/purchaseSlice';

import { filterAllByMonth } from '@utils/filterByDate';

import EmptyChart from '@assets/svgs/empty-chart-3.svg';

import { Dimensions, StatusBar, FlatList } from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';

import LinearGradient from 'react-native-linear-gradient';

import Header from '@components/Header';
import FinancialCard from '@components/FinancialCard';
import Button from '@components/Button';
import Loading from '@components/Loading';
import AddPurchaseBottomSheetModal from './AddPurchaseBottomSheetModal';
import Overview from '@components/Overview';

const { height } = Dimensions.get('window');

export const FinancialSpending = () => {
  const [showContent, setShowContent] = useState(false);
  const [spendingFilteredByMonth, setSpendingFilteredByMonth] = useState<
    PurchaseModel[][] | null
  >(null);

  const dispatch = useReduxDispatch();

  const { allPurchases, isLoading } = useReduxSelector(state => state.purchase);

  const isFocused = useIsFocused();

  const { goBack } = useNavigation();

  const { t } = useTranslation();

  const theme = useTheme();

  const heightList = useMemo(
    () => height - 120 - 32 - 24 - 8 - 220 - 32 - 16 - 44 - 16 - 72,
    [],
  );

  const addPurchaseBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleShowAddPurchaseBottomSheet = useCallback(() => {
    addPurchaseBottomSheetModalRef.current?.present();
  }, []);

  const handleColseAddPurchaseBottomSheet = useCallback(() => {
    addPurchaseBottomSheetModalRef.current?.dismiss();
  }, []);

  const getPurchases = useCallback(() => {
    dispatch(GET_PURCHASES());
  }, [dispatch]);

  useEffect(() => {
    getPurchases();
  }, [getPurchases, isFocused]);

  useEffect(() => {
    if (allPurchases && !isLoading) {
      setTimeout(() => setShowContent(true), 1000);
    }
  }, [allPurchases, isLoading]);

  useEffect(() => {
    if (allPurchases?.length) {
      const data = filterAllByMonth({
        data: allPurchases,
      }) as unknown as PurchaseModel[][];

      setSpendingFilteredByMonth(data);
    }
  }, [allPurchases]);

  return (
    <StyledContainer
      colors={[
        theme.colors.BACKGROUND_WEAKYELLOW,
        theme.colors.BACKGROUND_OFFWHITE,
      ]}
    >
      <Header
        title={t('components.header.financialSpending')}
        onPress={goBack}
      />

      {showContent ? (
        <StyledContent>
          {spendingFilteredByMonth ? (
            <>
              <StyledTitleOverview>
                {t('screens.financialSpending.overview')}
              </StyledTitleOverview>

              {spendingFilteredByMonth && (
                <Overview
                  data={spendingFilteredByMonth.map(spendingMonth => {
                    return {
                      months: spendingMonth.length
                        ? new Date(
                            spendingMonth[0].createdAt,
                          ).toLocaleDateString('pt-br', { month: 'long' })
                        : new Date().toLocaleDateString('pt-br', {
                            month: 'long',
                          }),
                      earnings: spendingMonth.reduce(
                        (prev, curr) => prev + curr.totalPrice * -1,
                        0,
                      ),
                    };
                  })}
                  type="spending"
                />
              )}

              <FlatList
                data={allPurchases}
                renderItem={({ item }) => (
                  <FinancialCard
                    key={item.id}
                    item={{
                      title: item.product?.name || item.expanse,
                      date: item.createdAt,
                      price: item.totalPrice,
                    }}
                  />
                )}
                style={{
                  height: StatusBar.currentHeight
                    ? heightList - StatusBar.currentHeight
                    : heightList,
                  marginVertical: 16,
                  paddingHorizontal: 32,
                }}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
              />
            </>
          ) : (
            <StyledContainerEmptySpending>
              <EmptyChart width={132} height={132} />
              <StyledTextEmptySpending>
                Ainda não tem nenhum registro da suas dispesas...
              </StyledTextEmptySpending>
            </StyledContainerEmptySpending>
          )}

          <Button
            title={t('components.button.addExpense')}
            onPress={handleShowAddPurchaseBottomSheet}
          />
        </StyledContent>
      ) : (
        <Loading />
      )}

      <AddPurchaseBottomSheetModal
        ref={addPurchaseBottomSheetModalRef}
        closeBottomSheet={handleColseAddPurchaseBottomSheet}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(LinearGradient)`
  min-height: 100%;
`;

const StyledContent = styled.View`
  padding: 32px 0;
`;

const StyledTitleOverview = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_MEDIUM};
  font-size: ${({ theme }) => theme.sizing.SMALL};

  color: ${({ theme }) => theme.colors.GRAY_800};

  line-height: 24px;

  padding: 0 32px;
  margin-bottom: 8px;
`;

const StyledContainerEmptySpending = styled.View`
  height: ${StatusBar.currentHeight
    ? height - StatusBar.currentHeight - 120 - 72
    : height - 120 - 72}px;

  justify-content: center;
  align-items: center;

  margin-top: -32px;
`;

const StyledTextEmptySpending = styled.Text`
  width: 80%;

  font-family: ${({ theme }) => theme.fonts.HEEBO_REGULAR};
  font-size: ${({ theme }) => theme.sizing.SMALLEST};

  color: ${({ theme }) => theme.colors.GRAY_800};

  text-align: center;

  margin-top: 16px;
`;
