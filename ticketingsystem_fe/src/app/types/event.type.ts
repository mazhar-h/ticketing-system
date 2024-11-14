export type Event = {
    id: string,
    name: string,
    description: string,
    status: string,
    date: Date,
    venue: Venue,
    performers: Performer[],
    url: string,
    type: string,
    tickets: Ticket[],
    images: any[],
    location?: {
      latitude: number,
      longitude: number,
    },
    genres? : []
  };

  export type Venue = {
    name: string
  };

  export type Performer = {
    name: string
  };

  export type Ticket = {
    id: string,
    name: string,
    price: number,
    status: string
  }