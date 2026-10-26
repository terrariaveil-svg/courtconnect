
export interface Facility {
  id: number;
  name: string;
  type: string;
  location: string;
  price: number;
  image: string;
  description: string;
}

export interface Booking {
  id: number;
  facility: Facility;
  date: string;
  startTime: string;
  endTime: string;
  customer: string;
  status: "Confirmed";
}

export interface SportEvent {
  id: number;
  name: string;
  category: string;
  date: string;
  price: number;
}
