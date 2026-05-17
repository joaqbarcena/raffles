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
}

export interface CreateRaffleInput {
  title: string;
  prizes: string[];
  totalNumbers: number;
  numbersPerRow: number;
}

export interface AddParticipantInput {
  name: string;
  numbers: number[];
}
