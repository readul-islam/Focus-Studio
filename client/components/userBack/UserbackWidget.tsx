'use client';

import { useEffect } from 'react';
import Userback from '@userback/widget';

const UserbackWidget = () => {
  useEffect(() => {
    const token =
      typeof process.env.NEXT_PUBLIC_USERBACK_TOKEN === 'string' &&
      process.env.NEXT_PUBLIC_USERBACK_TOKEN.length > 0
        ? process.env.NEXT_PUBLIC_USERBACK_TOKEN
        : undefined;
    if (!token) return;

    const options = {
      user_data: {
        id: '123456',
        info: {
          name: 'someone',
          email: 'someone@example.com',
        },
      },
    };

    Userback(token, options).catch(() => {
      /* Invalid token/project or Userback outage — avoid crashing the Next.js overlay */
    });
  }, []);

  return null;
};

export default UserbackWidget;
