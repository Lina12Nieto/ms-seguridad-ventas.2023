import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class RolMenu extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  listar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  guardar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  editar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  eliminar: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  descragar: boolean;

  @property({
    type: 'string',
  })
  rolId?: string;

  @property({
    type: 'string',
  })
  menuId?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<RolMenu>) {
    super(data);
  }
}

export interface RolMenuRelations {
  // describe navigational properties here
}

export type RolMenuWithRelations = RolMenu & RolMenuRelations;
