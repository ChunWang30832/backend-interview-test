import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { ItemRepository, TodoRepository } from '../repositories';
import { Item, Todo } from '../models';

@injectable({scope: BindingScope.TRANSIENT})
export class TodoService {
  constructor(
    @repository(TodoRepository) public todoRepository: TodoRepository,
    @repository(ItemRepository) public itemRepository: ItemRepository
  ) {}

  async createTodoWithItems(todo: Todo, items: Item[]): Promise<Todo> {
    const createdTodo = await this.todoRepository.create(todo);
    for (const item of items) {
      item.todoId = createdTodo.id;
      await this.itemRepository.create(item);
    }
    return createdTodo;
  }
}