import React from 'react';
import ReactDOM from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: 'web3Satoshi',
  projectId: 'demo-project-id',
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
  ssr: false,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
