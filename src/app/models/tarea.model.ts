export interface Tarea {
    id: string;
    titulo: string;
    descripcion: string;
    asignados: string;
    urgente: boolean;
    estado: 'pendiente' | 'completada';
    creado_en: string;
    completado_en: string | null;
}
//"versiones modificadas" de ese molde (interface) para situaciones específicas.
export type NuevaTarea = Omit<Tarea, 'id' | 'creado_en' | 'completado_en'>;
export type ActualizarTarea = Partial<NuevaTarea>;