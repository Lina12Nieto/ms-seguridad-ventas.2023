import {Entity, model, property, hasMany} from '@loopback/repository';
import {Menu} from './menu.model';
import {RolMenu} from './rol-menu.model';
import {Usuario} from './usuario.model';

@model({settings: {strict: false}})
export class Rol extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nombre: string;

  @property({
    type: 'string',
  })
  Comentarios?: string;

  @hasMany(() => Menu, {through: {model: () => RolMenu}})
  (menus): Menu[];

  @hasMany(() => Menu, {through: {model: () => RolMenu}})
  menus: Menu[];

  @hasMany(() => Usuario)
  usuarios: Usuario[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Rol>) {
    super(data);
  }
}

export interface RolRelations {
  // describe navigational properties here
}

export type RolWithRelations = Rol & RolRelations;
