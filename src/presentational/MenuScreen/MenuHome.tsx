import React, { useCallback, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';

import i18next from 'i18next/index';
import { useTranslation } from 'react-i18next';
import { useUserStorage } from '@hooks/useUserStorage';
import { useNavigation } from '@react-navigation/native';
import { useReduxDispatch } from '@hooks/useReduxDispatch';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MenuStackParamList } from '@routes/stacks/MenuStack';
import { RFValue } from 'react-native-responsive-fontsize';

import { LOGOUT } from '@store/slices/userSlice';

import { Dimensions } from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Header from '@components/Header';
import SelectLanguageModal from './SelectLanguageModal';
import WarningLogoutModal from './WarningLogoutModal';
import Background from '@components/Background';

type NavProps = NativeStackNavigationProp<MenuStackParamList, 'MenuHelper'>;

const { height } = Dimensions.get('window');

export const MenuHome = () => {
  const [visibleSelectLanguage, setVisibleSelectLanguage] = useState(false);
  const [visibleWarningLogout, setVisibleWarningLogout] = useState(false);

  const dispatch = useReduxDispatch();

  const userStorage = useUserStorage();

  const { navigate } = useNavigation<NavProps>();

  const { t } = useTranslation();

  const theme = useTheme();

  const handleLanguage = (language: 'pt' | 'es' | 'en') => {
    i18next.changeLanguage(language);

    userStorage.saveUserLanguage('language', language);

    setVisibleSelectLanguage(false);
  };

  const handleLogout = useCallback(() => {
    dispatch(LOGOUT());

    setVisibleWarningLogout(false);
  }, [dispatch]);

  return (
    <Background>
      <Header
        title={t('components.header.menuHome')}
        backgroundColor="SECUNDARY_600"
      />

      <StyledContent>
        <StyledContainerOptions>
          <StyledBaseButton onPress={() => setVisibleSelectLanguage(true)}>
            <StyledTextButton>
              {t('screens.menuHome.options.language')}
            </StyledTextButton>
          </StyledBaseButton>

          <StyledBaseButton onPress={() => navigate('MenuHelper')}>
            <StyledTextButton>
              {t('screens.menuHome.options.help')}
            </StyledTextButton>
          </StyledBaseButton>
        </StyledContainerOptions>

        <StyledBaseButtonLogout onPress={() => setVisibleWarningLogout(true)}>
          <Icon name="logout" color={theme.colors.GRAY_800} size={24} />
          <StyledTextButtonLogout>
            {t('screens.menuHome.logout')}
          </StyledTextButtonLogout>
        </StyledBaseButtonLogout>
      </StyledContent>

      <SelectLanguageModal
        visible={visibleSelectLanguage}
        setVisible={setVisibleSelectLanguage}
        handleLanguage={handleLanguage}
      />

      <WarningLogoutModal
        visible={visibleWarningLogout}
        setVisible={setVisibleWarningLogout}
        handleLogout={handleLogout}
      />
    </Background>
  );
};

const StyledContent = styled.View`
  padding: 32px;
`;

const StyledContainerOptions = styled.View`
  height: ${height - 120 - 32 - RFValue(24) - 32 - 72}px;
`;

const StyledBaseButton = styled.TouchableOpacity`
  height: 40px;
`;

const StyledTextButton = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_MEDIUM};
  font-size: ${({ theme }) => theme.sizing.SMALLEST};

  color: ${({ theme }) => theme.colors.GRAY_800};
`;

const StyledBaseButtonLogout = styled(StyledBaseButton)`
  height: ${RFValue(24)}px;

  flex-direction: row;

  align-self: baseline;
`;

const StyledTextButtonLogout = styled(StyledTextButton)`
  font-size: ${({ theme }) => theme.sizing.SMALLER};

  color: ${({ theme }) => theme.colors.SECUNDARY_800};

  margin-left: 5px;
`;
