import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Request} from '@loopback/rest/dist/types';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {RolMenuRepository} from '../repositories';
import {AuthService, SeguridadUsuarioService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private serviceSeguridead:SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata[],
    @repository(RolMenuRepository)
    private repositorioRolMenu:RolMenuRepository,
    @service(AuthService)
    private servicioAuth: AuthService
  ) {}

  /**
   * Autenticacion de un usuario frente a una accion en la base de datos
   * @param request la solicitud con el token
   * @returns  el perfil de usuario, undefined cuando el no tiene permiso o un httpError
   */

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = parseBearerToken(request);
    if(token){
      const idRol = this.serviceSeguridead.obtenerRolDesdeToken(token);
      const idMenu: string = this.metadata[0].options![0];
      const accion: string = this.metadata[0].options![1];
      console.log(this.metadata);
      try{
        const res = await this.servicioAuth.verificarPermisoDeUsuarioPorRol(idRol, idMenu, accion);
        return res;
      }catch(e){
        throw e;
      }
    }
   throw new HttpErrors[401]("No es posible ejecutar la accion por falta de un token");
  }
}
