import { Page, expect } from "@playwright/test";

export type Statuses = "Active" | "Completed" | "Deleted";

export class ToDoApp {
  page: Page;
  todos: Array<ToDo>;
  placeholder: string;

  constructor(page: Page) {
    this.page = page;
    this.todos = [];
    this.placeholder = "What needs to be done?";
  }

  private async visit() {
    await this.page.goto("https://demo.playwright.dev/todomvc");
  }

  async createNewToDo() {
    const toDo = new ToDo();
    await this.visit();
    const newTodo = this.page.getByPlaceholder(this.placeholder);
    await newTodo.fill(toDo.name);
    await newTodo.press("Enter");
    this.todos.push(toDo);
  }

  async createNewToDos(count: number) {
    for (let i = 0; i < count; i++) {
      await this.createNewToDo();
    }
  }

  async verifyInputFieldIsEmpty() {
    const newTodo = this.page.getByPlaceholder(this.placeholder);
    await expect(newTodo).toBeEmpty();
  }

  async verifyToDosDisplayed() {
    await this.visit();
    await expect(this.page.getByTestId("todo-title")).toHaveText(
      this.todos.map((todo) => todo.name)
    );
  }

  async verifyItemCountCorrect() {
    const expectedCount = this.todos.length;
    await this.visit();
    // create a todo count locator
    const todoCount = this.page.getByTestId("todo-count");

    // Check test using different methods.
    await expect(
      this.page.getByText(`${expectedCount} items left`)
    ).toBeVisible();
    await expect(todoCount).toHaveText(`${expectedCount} items left`);
    await expect(todoCount).toContainText(`${expectedCount}`);
    await expect(todoCount).toHaveText(new RegExp(`${expectedCount}`));
  }

  async verifyLocalStorage() {
    await this.page.waitForFunction((e) => {
      return JSON.parse(localStorage["react-todos"]).length === e;
    }, this.todos.length);
    for (const todo of this.todos) {
      await this.checkTodosInLocalStorage(todo.name);
    }
  }

  private async checkTodosInLocalStorage(title: string) {
    return await this.page.waitForFunction((t) => {
      return JSON.parse(localStorage["react-todos"])
        .map((todo: any) => todo.title)
        .includes(t);
    }, title);
  }
}

export class ToDo {
  name: string;
  status: Statuses;
  page: Page;

  constructor() {
    this.name = `Do ${Date.now() + Math.floor(Math.random() * 100)}`;
    this.status = "Active";
  }
}
