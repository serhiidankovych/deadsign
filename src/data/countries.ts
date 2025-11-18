export interface Country {
  name: string;
  flag: string;
  lifeExpectancy: number;
}

export const countries: Country[] = [
  { name: "Ukraine", flag: "🇺🇦", lifeExpectancy: 72 },
  { name: "United States", flag: "🇺🇸", lifeExpectancy: 79 },
  { name: "Germany", flag: "🇩🇪", lifeExpectancy: 81 },
  { name: "Japan", flag: "🇯🇵", lifeExpectancy: 85 },
  { name: "United Kingdom", flag: "🇬🇧", lifeExpectancy: 81 },
];

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find((country) => country.name === name);
};
