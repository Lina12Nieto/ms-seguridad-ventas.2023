import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {ConfiguracionNotificaciones} from '../config/notificaciones.config';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, HashValidacionUsuario, Login, PermisosRolMenu, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
import {AuthService, NotificacionesService, SeguridadUsuarioService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service(SeguridadUsuarioService)
    public servicioSeguridad:SeguridadUsuarioService,
    @repository(LoginRepository)
    public respositorioLogin: LoginRepository,
    @service(AuthService)
    private serviceoAuth: AuthService,
    @service(NotificacionesService)
    public servicioNotificaciones: NotificacionesService
  ) {}

  @authenticate({
    strategy:"auth",
    options:["Usuario","guardar"]
  })
  @post('/usuario')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    //crear la clave
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave)
    //asignar la clave  un usuario
    usuario.clave = claveCifrada;
    usuario.estadoValidacion=true;
    //enviar correo electronico de notificaciones
    return this.usuarioRepository.create(usuario);
  }

  @post('/usuario-publico')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
    async creacionPublica(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Usuario, {
              title: 'NewUsuario',
              exclude: ['_id'],
            }),
          },
        },
      })
      usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    //crear la clave
    const clave = this.servicioSeguridad.crearTextoAleatorio(10);
    console.log(clave);
    //cifrar la clave
    const claveCifrada = this.servicioSeguridad.cifrarTexto(clave)
    //asignar la clave  un usuario
    usuario.clave = claveCifrada;
    //hash de validacion de correo Electronico
    const hash = this.servicioSeguridad.crearTextoAleatorio(100);
    usuario.hashValidacion = hash;
    usuario.estadoValidacion = false;
    usuario.aceptado= false;
    usuario.rolId=ConfiguracionSeguridad.rolUsusaioPublico;

    //notificar al usuario la verificacion del correo por medio del hash

    let enlace = `<a #href="${ConfiguracionNotificaciones.urlValidacionCorreoFrontend}/${hash}" target = '_blank'>Validar</a>`;
    let datos = {
      correoDestino: usuario.correo,
      nombreDestino:usuario.primerNombre + " " + usuario.segundoNombre,
      contenidoCorreo:`Porfavor visite este link para validar su correo Electronico: ${enlace}`,
      asuntocorreo:ConfiguracionNotificaciones.asuntoVerificacionCorreo,
    };
    let url = ConfiguracionNotificaciones.urlNotificaciones2fa;
    this.servicioNotificaciones.EnviarCorreElectronico(datos,url);
    // Enviar de clave
    let datosCorreo = {
      correoDestino: usuario.correo,
      nombreDestino:usuario.primerNombre + " " + usuario.segundoNombre,
      contenidoCorreo:`Su clave asignada es: ${clave}`,
      asuntocorreo:ConfiguracionNotificaciones.claveAsignada,
    };
    this.servicioNotificaciones.EnviarCorreElectronico(datosCorreo,url);
    //enviar correo electronico de notificaciones
    return this.usuarioRepository.create(usuario);
  }

  // Validar Codigo Hash

  @post('/validar-hash-usuario')
  @response(200, {
    description: 'Validar hash'
  })
    async ValidarHahUsuario(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(HashValidacionUsuario, {}),
          },
        },
      })
      hash: HashValidacionUsuario,
  ): Promise<boolean> {
    let usuario = await this.usuarioRepository.findOne({
      where:{
        hashValidacion: hash.codigohash,
        estadoValidacion: false
      }
    });
    if(usuario){
      usuario.estadoValidacion = true;
      this.usuarioRepository.replaceById(usuario._id, usuario);
      return true;
    }
    return false;

  }


  @get('/usuario/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @authenticate({
    strategy:"auth",
    options:[ConfiguracionSeguridad.menuUsuarioId, ConfiguracionSeguridad.listarAccion]
  })
  @get('/usuario')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuario')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuario/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuario/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuario/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuario/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }


  /**
   * Metodos personalizados para la API
   */

  @post('/identificar-usuario')
  @response(200,{
    description:"identificar un usuario por correo y clave",
    content:{'application/json':{schema:getModelSchemaRef(Usuario)}}
  })
  async identificarUsuario(
    @requestBody(
      {
        content:{
          'application/json':{
            schema: getModelSchemaRef(Credenciales)
          }
        }
      }
    )
    credenciales:Credenciales

  ): Promise<object> {
    const usuario = await this.servicioSeguridad.identificarUsuario(credenciales);
    if(usuario){
      const codigo2fa = this.servicioSeguridad.crearTextoAleatorio(5);
      console.log(codigo2fa);
      const login: Login = new Login();
      login.usuarioId = usuario._id!;
      login.codigo2fa = codigo2fa;
      login.estadoCodigo2fa = false;
      login.token = "";
      login.estadoToken = false;
      await this.respositorioLogin.create(login);
      usuario.clave = "";

      //NOTIFICAR AL USUARIO VIA CORREO O SMS

      let datos = {
        correoDestino: usuario.correo,
        nombreDestino:usuario.primerNombre + " " + usuario.segundoNombre,
        contenidoCorreo:`Su codigo de segundo factor de autenticacion es: ${codigo2fa}`,
        asuntocorreo:ConfiguracionNotificaciones.asunto2fa,
      };
      let url = ConfiguracionNotificaciones.urlNotificaciones2fa;
      this.servicioNotificaciones.EnviarCorreElectronico(datos,url);
      return usuario;
    }
    return new HttpErrors[401]("Credenciales incorrectas.");
  }
  // copia codigo anterior
  @post('/validar-permisos')
  @response(200,{
    description:"validacion de permisos de usuario para logca de negocio. ",
    content:{'application/json':{schema:getModelSchemaRef(PermisosRolMenu)}}
  })
  async validarPermisosDeUsuario(
    @requestBody(
      {
        content:{
          'application/json':{
            schema: getModelSchemaRef(PermisosRolMenu)
          }
        }
      }
    )
   datos:PermisosRolMenu

  ): Promise<UserProfile | undefined> {
    let idRol = this.servicioSeguridad.obtenerRolDesdeToken(datos.token);
    return this.serviceoAuth.verificarPermisoDeUsuarioPorRol(idRol, datos.idMenu, datos.accion);

  }


  @post('/verificar-2fa')
  @response(200,{
    description:"validar un codigo de 2fa"
  })
  async verificarCodigo2fa(
    @requestBody(
      {
        content:{
          'application/json':{
            schema: getModelSchemaRef(FactorDeAutenticacionPorCodigo)
          }
        }
      }
    )
    credenciales:FactorDeAutenticacionPorCodigo
  ): Promise<object> {
    const usuario = await this.servicioSeguridad.validarCodigo2fa(credenciales);
    if(usuario){
      const token = this.servicioSeguridad.crearToken(usuario);
      let menu=[];
      if (usuario){
        usuario.clave="";
        try{
         await this.usuarioRepository.logins(usuario._id).patch(
            {
              estadoCodigo2fa: true,
              token:token
            },
            {
              estadoCodigo2fa:false
            });
        }catch{
          console.log("No se ha almacenado el cambio de estado del token en la base de datos. ")
        }
        menu = await this.servicioSeguridad.ConsultarPermisosDeMenuPorUsuario(usuario.rolId)
        return{
          user:usuario,
          token:token,
          menu: menu
        };
      }
    }
    return new HttpErrors[401]("Codigo de 2fa invalido para el usuario definido.")
  }
}
