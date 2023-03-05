import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    public repositorioUsuario: UsuarioRepository,
    @repository(LoginRepository)
    public repositorioLogin:LoginRepository
  ) {}

  /**
   * Crear clave aleatoria
   * @returns cadena aleatoria de 10 caracteres
  */

  crearTextoAleatorio(n:number):string{
    const password = generator.generate({
      length: n,
      numbers: true
    });
    return password;
  }


  /**
   * Cifrar una cadea con metodos md5
   * @param cadena texto a cifrar
   * @returns cadena cifrada con md5
   */
  cifrarTexto(cadena:string):string{
    const cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;

  }

  /**
   * se busca un usuario por sus credenciales de inicio
   * @param credenciales credenciales del usuario
   * @returns usuario encontrado o nulo
   */

  async identificarUsuario(credenciales:Credenciales): Promise<Usuario|null>{
    const usuario = await this.repositorioUsuario.findOne({
      where:{
        correo: credenciales.correo,
        clave:credenciales.clave
      }
    });
    return usuario as Usuario;
  }

  /**
   * valida un codigo de 2fa para un usuario
   * @param credenciales2fa credenciales del usuario con el codigo del 2fa
   * @returns el registro de login o null
  */

  async validarCodigo2fa(credenciales2fa:FactorDeAutenticacionPorCodigo):Promise <Usuario | null>{
    const login = this.repositorioLogin.findOne({
      where:{
        usuarioId: credenciales2fa.usuarioId,
        codigo2fa: credenciales2fa.codigo2fa,
        estadoCodigo2fa:false
      }
    });
    if (login){
      const usuario = await this.repositorioUsuario.findById(credenciales2fa.usuarioId);
      return usuario;
    }
    return null;
  }

  /**
   * generacion de jwt
   * @param usuario informacion Usuario
   * @returns un token
   */
  crearToken(usuario:Usuario):string{
    const datos ={
      name:`${usuario.primerNombre}${usuario.segundoNombre}${usuario.primerApellido}${usuario.segundoApellido}${usuario.celular}`,
      role: usuario.rolId,
      email: usuario.correo

    }
    const token = jwt.sign({ foo: 'bar' }, ConfiguracionSeguridad.claveJWT);
    return token;
  }
}