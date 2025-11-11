export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  image?: string;
}

export interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  filters?: {
    location?: string;
    budget?: string;
    bedrooms?: string;
  };
  properties?: Property[];
}
