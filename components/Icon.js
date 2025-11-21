// G:\stage1\components\Icon.js
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Icon = ({ name, size = 24, color = 'black' }) => {
  return <MaterialIcons name={name} size={size} color={color} />;
};

export default Icon;
