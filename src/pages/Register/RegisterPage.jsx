// src/pages/Register/RegisterPage.jsx
import React from 'react';
import StoreForm from '../../components/StoreForm/StoreForm';

const RegisterPage = ({ user }) => {
  return <StoreForm user={user} />;
};

export default RegisterPage;
