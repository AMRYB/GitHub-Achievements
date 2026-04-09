import React, { createContext, useContext, useState } from 'react';

type SearchContextType = {
  query: string;
  setQuery: (q: string) => void;
};

export const SearchContext = createContext<SearchContextType>({ query: '', setQuery: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>;
}

export const useSearch = () => useContext(SearchContext);
