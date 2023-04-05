export namespace ConfiguracionSeguridad{
  export const claveJWT = process.env.SECRET_PASSWORD_JWT;
  export const menuUsuarioId = "63fee414ff989827a81b1d6e";
  export const listarAccion = "listar";
  export const guardarAccion = "guardar";
  export const editarAccion = "editar";
  export const eliminarAccion = "eliminar";
  export const descargarAccion = "descargar";
  export const mongodbConnectionString = process.env.CONNECCTION_STRING_MONGODB;
}
