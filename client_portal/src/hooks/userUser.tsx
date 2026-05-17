import React, { useEffect, useState } from 'react';
import useFetch from './useFetch';

const useUser = () => {
  // const { data, isLoading, isError, refetch, isPending } = useFetch('user/self/');
  const data = JSON.parse(localStorage.getItem('user')) || null;
  const project = JSON.parse(localStorage.getItem('project')) || null;
  

  return {
    user: data,
    isLoading: false,
    project : project ? project[0] : null
  };
};

export default useUser;
