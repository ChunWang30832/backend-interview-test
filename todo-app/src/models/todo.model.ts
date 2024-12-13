import {Entity, model, property, hasMany} from '@loopback/repository';
import {Item} from './item.model';

@model()
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true, // 設定 id 為主鍵
    generated: true, // 使 id 自動生成
  })
  id: number;  // 確保這行存在並設置為數字類型

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: ['ACTIVE', 'INACTIVE'], // 限定值
    },
  })
  status: string;

  @property({
    type: 'string',
  })
  subtitle?: string;

  @property({
    type: 'boolean',
    default:false
  })
  deletedAt?: boolean; 

  @hasMany(() => Item)
  items: Item[];

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  // describe navigational properties here
}

export type TodoWithRelations = Todo & TodoRelations;
