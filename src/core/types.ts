export interface RawLanguage {
  name: string;
}

export interface RawCurrency {
  code: string;
  name: string;
  symbol?: string;
}

export interface RawCountry {
  name: string;
  nativeName?: string;
  alpha3Code?: string;
  flags?: { png?: string; svg?: string };
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: RawLanguage[];
  currencies?: RawCurrency[];
}

export interface Country {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  capital: string | null;
  region: string;
  subregion: string;
  population: number;
  area: number | null;
  languages: string[];
  currencies: string[];
  borders: string[];
}
