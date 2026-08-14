export enum TiposVista {
  Jornadas,
  Pagos,
  Estadisticas,
  Rachas,
  CaraACara,
  ManagerMes,
  Historico,
  Historico2526,
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

export enum Apodos {
  Yeray = "Yeray",
  Gaizka = "Gaizka",
  Gorka = "Gorka",
  Alonso = "Alonso",
  Gima = "Gima",
  Asier = "Asier",
  Aitor = "Aitor",
  ElManito = "El manito",
  Etxabe = "Etxabe",
  grz = "grz",
  muna = "muna",
  mitxi = "mitxi",
}
