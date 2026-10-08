import { useMemo, useState } from 'react';
import {
  useAccount,
  useBalance,
  useDisconnect,
  useSendTransaction,
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'viem';

type TokenKey = 'ETH' | 'USDC' | 'DAI' | 'MATIC';

const TOKEN_RATES: Record<TokenKey, number> = {
  ETH: 1,
  USDC: 1800,
  DAI: 1800,
  MATIC: 0.8,
};

const RECENT_ACTIVITY = [
  { type: 'Swap', asset: 'ETH → USDC', value: '+$2,840', status: 'Completed' },
  { type: 'Transfer', asset: '0x0a...2f1d', value: '0.42 ETH', status: 'Pending' },
  { type: 'Bridge', asset: 'Base → Ethereum', value: '$430', status: 'Completed' },
];

export default function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({ address });
  const { sendTransaction, isPending, data: txHash, error } = useSendTransaction();

  const [recipient, setRecipient] = useState('0x000000000000000000000000000000000000dEaD');
  const [amount, setAmount] = useState('0.25');
  const [swapFrom, setSwapFrom] = useState<TokenKey>('ETH');
  const [swapTo, setSwapTo] = useState<TokenKey>('USDC');
  const [swapAmount, setSwapAmount] = useState('1');

  const receiveAmount = useMemo(() => {
    const fromRate = TOKEN_RATES[swapFrom];
    const toRate = TOKEN_RATES[swapTo];
    const quote = (Number(swapAmount) * fromRate) / toRate;
    return Number.isFinite(quote) ? quote.toFixed(4) : '0';
  }, [swapFrom, swapTo, swapAmount]);

  const handleSend = () => {
    if (!recipient || !amount) return;

    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  const portfolioValue = useMemo(() => {
    if (!balanceData) return '$0.00';
    const ethPrice = 3200;
    const value = Number(balanceData.formatted) * ethPrice;
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }, [balanceData]);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">₿</div>
          <div>
            <p className="eyebrow">Web3 wallet</p>
            <h1>web3Satoshi</h1>
          </div>
        </div>

        <div className="topbar-actions">
          <button className="ghost-btn">Portfolio</button>
          <ConnectButton />
          {isConnected && (
            <button className="ghost-btn" onClick={() => disconnect()}>
              Disconnect
            </button>
          )}
        </div>
      </header>

      <main className="dashboard">
        <section className="hero panel">
          <div>
            <p className="eyebrow">Total balance</p>
            <h2>{portfolioValue}</h2>
          </div>

          <div className="chip-row">
            <span className="chip success">Live</span>
            <span className="chip">Ethereum Mainnet</span>
          </div>
        </section>

        <section className="summary-grid">
          <article className="panel stat-card">
            <p>Native balance</p>
            <strong>{balanceData ? Number(balanceData.formatted).toFixed(4) : '0.0000'} ETH</strong>
          </article>

          <article className="panel stat-card">
            <p>Wallet</p>
            <strong>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</strong>
          </article>

          <article className="panel stat-card">
            <p>Gas estimate</p>
            <strong>~ 18 gwei</strong>
          </article>
        </section>

        <section className="panel grid-two">
          <div className="section-header">
            <h3>Send transaction</h3>
          </div>

          <div className="form-group">
            <label>Recipient</label>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Amount (ETH)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <button className="primary-btn" onClick={handleSend} disabled={!isConnected || isPending}>
            {isPending ? 'Sending...' : 'Send ETH'}
          </button>

          {txHash && (
            <p className="tx-status">
              Transaction sent: <span>{`${txHash.slice(0, 12)}...${txHash.slice(-8)}`}</span>
            </p>
          )}

          {error && <p className="error-text">{error.message}</p>}
        </section>

        <section className="panel swap-panel">
          <div className="section-header">
            <h3>Swap</h3>
            <span className="link-pill">Best rate</span>
          </div>

          <div className="swap-box">
            <label>From</label>
            <div className="swap-input-row">
              <select value={swapFrom} onChange={(e) => setSwapFrom(e.target.value as TokenKey)}>
                {Object.keys(TOKEN_RATES).map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
              <input value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} />
            </div>
          </div>

          <div className="swap-divider">⇅</div>

          <div className="swap-box">
            <label>To</label>
            <div className="swap-input-row">
              <select value={swapTo} onChange={(e) => setSwapTo(e.target.value as TokenKey)}>
                {Object.keys(TOKEN_RATES).map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
              <input value={receiveAmount} readOnly />
            </div>
          </div>

          <button className="primary-btn" disabled={!isConnected}>
            Review swap
          </button>
        </section>

        <section className="panel activity-panel">
          <div className="section-header">
            <h3>Recent activity</h3>
          </div>

          <ul className="activity-list">
            {RECENT_ACTIVITY.map((item) => (
              <li key={`${item.type}-${item.asset}`}>
                <div>
                  <strong>{item.type}</strong>
                  <span>{item.asset}</span>
                </div>
                <div className="activity-meta">
                  <strong>{item.value}</strong>
                  <span>{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
