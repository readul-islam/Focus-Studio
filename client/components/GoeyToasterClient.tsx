'use client';

import { GoeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';

export default function GoeyToasterClient() {
  return <GoeyToaster duration={2000} preset='smooth' maxQueue={3} theme='dark' position="bottom-right" />;
}
