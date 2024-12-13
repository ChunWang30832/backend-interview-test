import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import{
  TodoService
} from '../services/todo-service.service'
import {Item, Todo} from '../models';
import {ItemRepository, TodoRepository} from '../repositories';
import { inject } from '@loopback/core';


export class TodoController {
  constructor(
    @repository(TodoRepository) public todoRepository: TodoRepository,
    @repository(ItemRepository) public itemRepository: ItemRepository,
    @inject('services.TodoService') public todoService: TodoService // 確保名稱正確
  ) {}

  @post('/todos')
  @response(200, {
    description: 'Todo model instance',
    content: {'application/json': {schema: getModelSchemaRef(Todo)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              todo: getModelSchemaRef(Todo, {title: 'NewTodo'}),
              items: {
                type: 'array',
                items: getModelSchemaRef(Item),
              },
            },
          },
        },
      },
    })
    requestBody: {todo: Todo; items: Item[]},
  ): Promise<Todo> {
    const {todo, items} = requestBody;
    return this.todoService.createTodoWithItems(todo, items);
  }
  

  @get('/todos/count')
  @response(200, {
    description: 'Todo model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Todo) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoRepository.count(where);
  }
////////////////////////////////////////////////////////////////////
  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Todo) filter?: Filter<Todo>,
    @param.query.number('limit') limit?: number, // 每頁幾筆
    @param.query.number('offset') offset?: number // 從第幾筆開始
  ): Promise<Todo[]> {
    const todosWithItems = await this.todoRepository.find({
      ...filter,
      where: {
        ...filter?.where, 
        deletedAt: false, // 過濾被刪除的資料
      },
      limit: limit ?? filter?.limit, // 優先使用查詢參數的 limit
      skip: offset ?? filter?.skip, // 優先使用查詢參數的 offset
      include: [{relation: 'items'}], 
    });
    return todosWithItems;
  }
  ////////////////////////////////////////////////

  @patch('/todos')
  @response(200, {
    description: 'Todo PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Todo,
    @param.where(Todo) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todoRepository.updateAll(todo, where);
  }

@get('/todos/{id}')
@response(200, {
  description: 'Todo model instance with items',
  content: {
    'application/json': {
      schema: getModelSchemaRef(Todo, {includeRelations: true}),
    },
  },
})
async findById(
  @param.path.number('id') id: number,
  @param.filter(Todo, {exclude: 'where'}) filter?: FilterExcludingWhere<Todo>
): Promise<Todo> {

  const todoWithItems = await this.todoRepository.findById(id, {
    ...filter,
    include: [{relation: 'items'}], 
  });
  return todoWithItems;
}

  @patch('/todos/{id}')
  @response(204, {
    description: 'Todo PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Todo,
  ): Promise<void> {
    await this.todoRepository.updateById(id, todo);
  }

  @put('/todos/{id}')
  @response(204, {
    description: 'Todo PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<void> {
    await this.todoRepository.replaceById(id, todo);
  }

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todoRepository.deleteById(id);

    await this.itemRepository.deleteAll({todoId: id});
  }
}
