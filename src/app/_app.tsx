import { useEffect } from 'react';
import { AppProps } from 'next/app';

if (process.env.NODE_ENV === 'development') {
  require('../mocks/browser');
}

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const { worker } = require('../mocks/browser');
      worker.start();
    }