import { useEffect, useState } from "react";
import { supabase } from "../supabase";

interface Jugador {
  id: number;
  nombre: string;
}

interface Jornada {
  id?: number;
  numeroJornada: number;
  jugador: string;
  idJugador: number;
  puntos: number;
  pago: number;
  posicion: number;
}

export const useJornada = (numeroJornada: number) => {
  const [jornada, setJornada] = useState<Jornada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Traer todos los jugadores
      const { data: jugadores, error: errorJugadores } = await supabase
        .from("jugadores")
        .select("id, apodo")
        .order("id");

      if (errorJugadores) {
        console.error(errorJugadores);
        setLoading(false);
        return;
      }

      // Traer jornada concreta
      const { data: jornadaData, error: errorJornada } = await supabase
        .from("jornadas")
        .select("*")
        .eq("numeroJornada", numeroJornada);

      if (errorJornada) {
        console.error(errorJornada);
        setLoading(false);
        return;
      }

      if (!jornadaData || jornadaData.length === 0) {
        const defaultJornada = jugadores.map((j) => ({
          numeroJornada,
          jugador: j.apodo,
          idJugador: j.id,
          puntos: 0,
          pago: 0,
          posicion: 0,
        }));
        setJornada(defaultJornada);
      } else {
        setJornada(jornadaData);
      }

      setLoading(false);
    };

    fetchData();
  }, [numeroJornada]);

  return { jornada, loading };
};
