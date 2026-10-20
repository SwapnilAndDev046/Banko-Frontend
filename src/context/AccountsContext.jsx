import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import * as accountApi from '../services/accountApi';
import { useAsync } from '../hooks/useAsync';

const AccountsContext = createContext(null);
const KEY = 'banko.selectedAccount'; // a UI preference only, never used for authorization

/**
 * Wraps all customer pages. One source of truth for "my accounts" and the selected account,
 * so the balance card and the transaction history always refer to the same account.
 */
export function CustomerShell() {
  const { data, loading, error, reload } = useAsync(() => accountApi.myAccounts(), []);
  const [selectedNumber, setSelectedNumber] = useState(() => {
    try { return sessionStorage.getItem(KEY); } catch { return null; }
  });
  const [version, setVersion] = useState(0); // bumps after deposits/transfers so history refetches

  const accounts = data || [];
  const selected = accounts.find((a) => a.accountNumber === selectedNumber) || accounts[0] || null;

  const select = (accountNumber) => {
    setSelectedNumber(accountNumber);
    try { sessionStorage.setItem(KEY, accountNumber); } catch { /* storage unavailable */ }
  };
  const refresh = async () => {
    reload();
    setVersion((v) => v + 1);
  };

  return (
    <AccountsContext.Provider value={{ accounts, selected, select, loading, error, refresh, version }}>
      <Outlet />
    </AccountsContext.Provider>
  );
}

export const useAccounts = () => useContext(AccountsContext);
