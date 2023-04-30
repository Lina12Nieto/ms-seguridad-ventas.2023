export namespace ConfiguracionNotificaciones{
  export const urlNotificaciones2fa:string = "http://localhost:7287/enviar-correo-2fa";
  export const asunto2fa: string = "Codigo de Verificacion";
  export const urlValidacionCorreoFrontend:string = "http://localhost:4200/seguridad/validar-hash-usuario-publico";
  export const asuntoVerificacionCorreo: string = "Verificacion de correo";
  export const claveAsignada: string = "Asignacion de clave";
}
