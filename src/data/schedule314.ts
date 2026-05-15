import type { RouteSchedule } from './scheduleTypes';

export const linea314Schedule: RouteSchedule = {
  code: '314',
  title: 'LINEA 314 | San Isidro ↔ Vicente López',
  directions: {
    ida: {
      label: 'SAN ISIDRO → V. LÓPEZ',
      stops: [
        'Estación San Isidro',
        'Av. Centenario y Márquez',
        'Av. Maipú y Paraná',
        'Melo y Av. Maipú',
        'Estación Florida',
        'Puente Saavedra'
      ],
      trips: [
        ['06:00', '06:10', '06:20', '06:30', '06:40', '06:50'],
        ['06:30', '06:40', '06:50', '07:00', '07:10', '07:20'],
      ]
    },
    vuelta: {
      label: 'V. LÓPEZ → SAN ISIDRO',
      stops: [
        'Puente Saavedra',
        'Estación Florida',
        'Melo y Av. Maipú',
        'Av. Maipú y Paraná',
        'Av. Centenario y Márquez',
        'Estación San Isidro'
      ],
      trips: [
        ['07:00', '07:10', '07:20', '07:30', '07:40', '07:50'],
        ['07:30', '07:40', '07:50', '08:00', '08:10', '08:20'],
      ]
    }
  }
};
