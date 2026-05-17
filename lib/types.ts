export interface Participant {
  id: string;
  name: string;
  numbers: number[];
  createdAt: string;
}

export interface Raffle {
  id: string;
  title: string;
  prizes: string[];
  totalNumbers: number;
  numbersPerRow: number;
  createdAt: string;
  participants: Participant[];
  prices: string[];
  paymentAlias: string;
  disclaimer: string;
  soldEmoji: string;
}

export interface CreateRaffleInput {
  title: string;
  prizes: string[];
  totalNumbers: number;
  numbersPerRow: number;
  prices: string[];
  paymentAlias: string;
  disclaimer: string;
  soldEmoji?: string;
}

export interface AddParticipantInput {
  name: string;
  numbers: number[];
}
