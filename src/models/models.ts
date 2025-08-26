export enum TiposVista {
  Jornadas,
  Jugadores,
  Pagos
}

export interface Jornada {
  id?: number;
  numeroJornada: number;
  idJugador: number;
  puntos: number;
  pago: number;
  posicion: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  apodo: string;
  puntos: number;
  descripcion: string;
  imagen?: string;
  pagos?: number;
}