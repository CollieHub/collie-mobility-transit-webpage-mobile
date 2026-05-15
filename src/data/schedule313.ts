import type { RouteSchedule } from './scheduleTypes';

export const linea313Schedule: RouteSchedule = {
  code: '313',
  title: 'LINEA 313 | Escobar ↔ Los Cardales',
  directions: {
    ida: {
      label: 'ESCOBAR → LOS CARDALES',
      stops: [
        'Terminal Escobar',
        'Ruta 25 y Panamericana',
        'Matheu',
        'Ruta 4 y Cercanías Campana',
        'Los Cardales'
      ],
      trips: [
        ['05:30', '05:45', '06:00', '06:15', '06:30'],
        ['06:00', '06:15', '06:30', '06:45', '07:00'],
      ]
    },
    vuelta: {
      label: 'LOS CARDALES → ESCOBAR',
      stops: [
        'Los Cardales',
        'Ruta 4 y Cercanías Campana',
        'Matheu',
        'Ruta 25 y Panamericana',
        'Terminal Escobar'
      ],
      trips: [
        ['06:30', '06:45', '07:00', '07:15', '07:30'],
        ['07:00', '07:15', '07:30', '07:45', '08:00'],
      ]
    }
  }
};
