import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Request} from '@loopback/rest/dist/types';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {RolMenuRepository} from '../repositories';
import {SeguridadUsuarioService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private serviceSeguridead:SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(RolMenuRepository)
    private repositorioRolMenu:RolMenuRepository
  ) {

  }

  /**
   * Autenticacion de un usuario frente a una accion en la base de datos
   * @param request la solicitud con el token
   * @returns  el perfil de usuario, undefined cuando el no tiene permiso o un httpError
   */

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = parseBearerToken(request);
    if(token){
      const idRol = this.serviceSeguridead.obtenerRolDesdeToken(token);
      const idMenu: string = this.metadata.options![0];
      const accion: string = this.metadata.options![1];


      const permiso = await this.repositorioRolMenu.findOne({
        where:{
          rolId : idRol,
          menuId:idMenu
        }
      });
      let continuar = false;
      if(permiso){
        switch (accion) {
          case "guardar":
            continuar=permiso.guardar;
            break;
          case "editar":
            continuar= permiso.editar;
            break;
          case "listar":
            continuar= permiso.listar;
            break;
          case "eliminar":
            continuar= permiso.eliminar;
            break;
          case "descargar":
            continuar = permiso.descargar;
            break;
          default:
            throw new HttpErrors[401]("No es posible ejecutar la accion porque no existe.");
        }
        if(continuar){
          const perfil: UserProfile= Object.assign({
            permitido: "Ok"
          });
          return perfil;
        }else{
          return undefined;
        }
      }else{
        throw new HttpErrors[401]("No es posible ejecutar la accion por falta de permisos");
      }
    }
   throw new HttpErrors[401]("No es posible ejecutar la accion por falta de un token");
  }
}
