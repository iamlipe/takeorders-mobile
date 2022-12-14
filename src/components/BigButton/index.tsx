import React, { memo } from 'react';
import styled, { useTheme } from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '@styles/colors';
import { RFValue } from 'react-native-responsive-fontsize';

interface BigButtomProps {
  title: string;
  icon?: {
    name: string;
    color: keyof typeof colors;
  };
  onPress: () => void;
}

const BigButton = ({ title, icon, onPress }: BigButtomProps) => {
  const theme = useTheme();

  return (
    <StyledContainer onPress={onPress}>
      <StyledText>{title}</StyledText>

      {icon && (
        <Icon
          name={icon.name}
          color={theme.colors[icon.color]}
          size={RFValue(24)}
        />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.TouchableOpacity`
  height: 100px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background-color: ${({ theme }) => theme.colors.PRIMARY_600};

  margin: 0 32px;
`;

const StyledText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.HEEBO_MEDIUM};
  font-size: ${({ theme }) => theme.sizing.SMALL};
  color: ${({ theme }) => theme.colors.WHITE};
`;

export default memo(BigButton);
