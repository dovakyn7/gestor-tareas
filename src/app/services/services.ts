import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { Tarea, NuevaTarea, ActualizarTarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root',
})
export class TareaService {

  async getTareas(): Promise<Tarea[]> {
    const { data, error } = await supabase
      .from('tarea')
      .select('*')
      .order('creado_en', { ascending: false });
    if (error) throw error;
    return data as Tarea[];
  }

  //tareas visibles en en componente board
  // pendientes (todas) + completadas de las últimas 12 horas
  async getTareasBoard(): Promise<Tarea[]> {
    const doceHorasAtras = new Date(
      Date.now() - 12 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('tarea')
      .select('*')
      .or(`estado.eq.pendiente,and(estado.eq.completada,completado_en.gte.${doceHorasAtras})`)
      .order('urgente', { ascending: false })
      .order('creado_en', { ascending: false });

    if (error) throw error;
    return data as Tarea[];
  }


  async crearTarea(tarea: NuevaTarea): Promise<Tarea> {
    const { data, error } = await supabase
      .from('tarea')
      .insert(tarea)
      .select()
      .single();

    if (error) throw error;
    return data as Tarea;

  }

  async actualizarTarea(id: string, cambios: ActualizarTarea): Promise<Tarea> {
    const { data, error } = await supabase
      .from('tarea')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Tarea;
  }

  async marcarCompletada(id: string): Promise<Tarea> {
    return this.actualizarTarea(id, { estado: 'completada' });
  }

  async eliminarTarea(id: string): Promise<void> {
    const { error } = await supabase
      .from('tarea')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ── REALTIME ──────────────────────────────────────────────

  // Suscribirse a cambios en la tabla tarea
  // Llama a este método desde el componente y pasa un callback
  suscribirCambios(callback: () => void) {
    return supabase
      .channel('tarea-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tarea' },
        () => callback()
      )
      .subscribe();
  }

  // Llamar en ngOnDestroy del componente para limpiar la suscripción
  desuscribir(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  }


}
