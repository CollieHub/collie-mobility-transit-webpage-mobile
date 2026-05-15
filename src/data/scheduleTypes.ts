export interface RouteSchedule {
  code: string;
  title: string;
  directions: {
    ida: {
      label: string;
      stops: string[];
      trips: string[][];
    };
    vuelta: {
      label: string;
      stops: string[];
      trips: string[][];
    };
  };
}
