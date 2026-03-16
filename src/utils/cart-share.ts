export interface SimpleCartItem {
  id: string;
  quantity: number;
}

export const encodeCart = (items: SimpleCartItem[]): string => {
  try {
    const json = JSON.stringify(items);
    return btoa(json);
  } catch (error) {
    console.error('Error encoding cart:', error);
    return '';
  }
};

export const decodeCart = (hash: string): SimpleCartItem[] => {
  try {
    const json = atob(hash);
    return JSON.parse(json);
  } catch (error) {
    console.error('Error decoding cart:', error);
    return [];
  }
};

export const generateShareUrl = (baseUrl: string, items: SimpleCartItem[]): string => {
  const hash = encodeCart(items);
  if (!hash) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set('share', hash);
  return url.toString();
};
