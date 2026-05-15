import type { RouteSchedule } from './scheduleTypes';

export const linea204Schedule: RouteSchedule = {
  code: '204',
  title: 'LINEA 204 | Escobar ↔ Zárate',
  directions: {
    ida: {
      label: 'ESCOBAR → ZÁRATE',
      stops: [
        'Terminal Escobar',
        'Ingeniero Maschwitz',
        'Panamericana y Ruta 26',
        'Campana',
        'Centro de Transferencia Zárate'
      ],
      trips: [
        ['05:00', '05:15', '05:30', '05:45', '06:00'],
        ['05:30', '05:45', '06:00', '06:15', '06:30'],
      ]
    },
    vuelta: {
      label: 'ZÁRATE → ESCOBAR',
      stops: [
        'Centro de Transferencia Zárate',
        'Campana',
        'Panamericana y Ruta 26',
        'Ingeniero Maschwitz',
        'Terminal Escobar'
      ],
      trips: [
        ['06:00', '06:15', '06:30', '06:45', '07:00'],
        ['06:30', '06:45', '07:00', '07:15', '07:30'],
      ]
    }
  }
};
