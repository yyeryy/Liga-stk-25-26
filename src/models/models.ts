export enum TiposVista {
  Jornadas,
  Pagos,
  Estadisticas,
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
  Fognini = "Fognini",
  Acierillo = "Acierillo",
  Dennis = "Dennis",
  Steven = "Steven",
  Polfovich = "Polfovich",
  LesbianaMadamme = "Lesbiana Madamme",
  Golo = "Golo",
  ElManito = "El manito",
  Karabinieri = "Karabinieri",
  MitxiJR = "Mitxi Jr",
  Zarrakatz = "Zarrakatz",
  Pitxu15pesos = "Pitxu15pesos",
}
