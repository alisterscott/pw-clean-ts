import { Locator, Page, expect } from "@playwright/test";

type Statuses = "active" | "completed" | "deleted";

class ToDo {
  name: string;
  status: Statuses;
  page: Page;

  constructor() {
    this.name = `Do ${Date.now() + Math.floor(Math.random() * 100)}`;
    this.status = "active";
  }
}

export class ToDoApp {
  page: Page;
  todos: Array<ToDo>;
  newToDoField: Locator;
  toggleAll: Locator;
  toDoItem: Locator;

  constructor(page: Page) {
    this.page = page;
    this.todos = [];
    this.newToDoField = this.page.getByPlaceholder("What needs to be done?");
    this.toggleAll = this.page.getByLabel("Mark all as complete");
    this.toDoItem = this.page.getByTestId("todo-item");
  }

  async visit() {
    await this.page.goto("https://demo.playwright.dev/todomvc");
  }

  async viewActive() {
    const activeLink = this.page.getByRole("link", { name: "Active" });
    await activeLink.click();
    await expect(activeLink).toHaveClass("selected");
  }

  async viewCompleted() {
    const completedLink = this.page.getByRole("link", { name: "Completed" });
    await completedLink.click();
    await expect(completedLink).toHaveClass("selected");
  }

  async viewAll() {
    const allLink = this.page.getByRole("link", { name: "All" });
    await allLink.click();
    await expect(allLink).toHaveClass("selected");
  }

  async createNewToDo() {
    const toDo = new ToDo();
    await this.newToDoField.fill(toDo.name);
    await this.newToDoField.press("Enter");
    this.todos.push(toDo);
  }

  async checkToDo(index: number = 0) {
    await this.page
      .locator("li")
      .filter({ hasText: this.todos[index].name })
      .getByLabel("Toggle Todo")
      .check();
    this.todos[index].status = "completed";
  }

  async editToDo(
    index: number = 0,
    saveMethod: "Enter" | "Blur" | "Escape",
    pad: boolean = false
  ) {
    const newToDo = new ToDo();
    const textToEnter = pad ? `     ${newToDo.name}      ` : newToDo.name;
    const todoItem = this.toDoItem.nth(index);
    await todoItem.dblclick();
    await expect(todoItem.getByRole("textbox", { name: "Edit" })).toHaveValue(
      this.todos[index].name
    );
    await todoItem.getByRole("textbox", { name: "Edit" }).fill(textToEnter);
    if (saveMethod === "Enter") {
      await todoItem.getByRole("textbox", { name: "Edit" }).press("Enter");
      this.todos[index] = newToDo;
    } else if (saveMethod === "Blur") {
      await todoItem
        .getByRole("textbox", { name: "Edit" })
        .dispatchEvent("blur");
      this.todos[index] = newToDo;
    } else if (saveMethod === "Escape") {
      await todoItem.getByRole("textbox", { name: "Edit" }).press("Escape");
    }
  }

  async editToDoToBlank(index: number = 0, saveMethod: "Enter" | "Blur") {
    const todoItem = this.toDoItem.nth(index);
    await todoItem.dblclick();
    await expect(todoItem.getByRole("textbox", { name: "Edit" })).toHaveValue(
      this.todos[index].name
    );
    await todoItem.getByRole("textbox", { name: "Edit" }).fill("");
    if (saveMethod === "Enter") {
      await todoItem.getByRole("textbox", { name: "Edit" }).press("Enter");
    } else {
      await todoItem
        .getByRole("textbox", { name: "Edit" })
        .dispatchEvent("blur");
    }
    this.todos.splice(index, 1);
  }

  async uncheckToDo(index: number = 0) {
    await this.page
      .locator("li")
      .filter({ hasText: this.todos[index].name })
      .getByLabel("Toggle Todo")
      .uncheck();
  }

  async verifyToDoComplete(index: number = 0) {
    await expect(this.toDoItem.nth(index)).toHaveClass("completed");
  }

  async verifyToDoNotComplete(index: number = 0) {
    await expect(this.toDoItem.nth(index)).not.toHaveClass("completed");
  }

  async createNewToDos(count: number) {
    for (let i = 0; i < count; i++) {
      await this.createNewToDo();
    }
  }

  async markAllAsCompleted() {
    await this.toggleAll.check();
    await expect(this.toggleAll).toBeChecked();
    this.todos.forEach((todo) => {
      todo.status = "completed";
    });
  }

  async markAllAsNotCompleted() {
    await this.toggleAll.uncheck();
    await expect(this.toggleAll).not.toBeChecked();
    this.todos.forEach((todo) => {
      todo.status = "active";
    });
  }

  async verifyToggleAllChecked() {
    await expect(this.toggleAll).toBeChecked();
  }

  async verifyToggleAllNotChecked() {
    await expect(this.toggleAll).not.toBeChecked();
  }

  async verifyTasksDisplayCompleted() {
    await expect(this.page.getByTestId("todo-item")).toHaveClass(
      this.todos.map((todo) => todo.status)
    );
  }

  async verifyTasksDisplayNotCompleted() {
    await expect(this.page.getByTestId("todo-item")).toHaveClass(
      this.todos.map(() => "")
    );
  }

  async verifyInputFieldIsEmpty() {
    await expect(this.newToDoField).toBeEmpty();
  }

  async verifyAllToDosDisplayed() {
    await expect(this.page.getByTestId("todo-title")).toHaveText(
      this.todos.map((todo) => todo.name)
    );
  }

  async verifyActiveToDosDisplayed() {
    await expect(this.page.getByTestId("todo-title")).toHaveText(
      this.todos
        .filter((todo) => todo.status === "active")
        .map((todo) => todo.name)
    );
  }

  async verifyCompletedToDosDisplayed() {
    await expect(this.page.getByTestId("todo-title")).toHaveText(
      this.todos
        .filter((todo) => todo.status === "completed")
        .map((todo) => todo.name)
    );
  }

  async verifyControlsDisabledWhenEditing(index: number = 0) {
    const todoItem = this.toDoItem.nth(index);
    await todoItem.dblclick();
    await expect(todoItem.getByRole("checkbox")).not.toBeVisible();
    await expect(
      todoItem.locator("label", {
        hasText: this.todos[index].name,
      })
    ).not.toBeVisible();
    await this.verifyLocalStorage();
  }

  async verifyItemCountCorrect() {
    const expectedCount = this.todos.length;
    const expectedText =
      expectedCount > 1
        ? `${expectedCount} items left`
        : `${expectedCount} item left`;
    // create a todo count locator
    const todoCount = this.page.getByTestId("todo-count");

    // Check test using different methods.
    await expect(this.page.getByText(expectedText)).toBeVisible();
    await expect(todoCount).toHaveText(expectedText);
    await expect(todoCount).toContainText(`${expectedCount}`);
    await expect(todoCount).toHaveText(new RegExp(`${expectedCount}`));
  }

  async clearCompleted() {
    await this.page.getByRole("button", { name: "Clear completed" }).click();
    this.todos = this.todos.filter((todo) => todo.status === "active");
  }

  async verifyClearCompletedButtonDisplayed() {
    await expect(
      this.page.getByRole("button", { name: "Clear completed" })
    ).toBeVisible();
  }

  async verifyClearCompletedButtonNotDisplayed() {
    await expect(
      this.page.getByRole("button", { name: "Clear completed" })
    ).not.toBeVisible();
  }

  async verifyLocalStorage() {
    await this.page.waitForFunction((l) => {
      return JSON.parse(localStorage["react-todos"]).length === l;
    }, this.todos.length);
    for (const todo of this.todos) {
      await this.checkTodosInLocalStorage(todo.name);
    }
  }

  async checkNumberOfCompletedTodosInLocalStorage(expected: number) {
    return await this.page.waitForFunction((e) => {
      return (
        JSON.parse(localStorage["react-todos"]).filter(
          (todo: any) => todo.completed
        ).length === e
      );
    }, expected);
  }

  private async checkTodosInLocalStorage(title: string) {
    return await this.page.waitForFunction((t) => {
      return JSON.parse(localStorage["react-todos"])
        .map((todo: any) => todo.title)
        .includes(t);
    }, title);
  }
}
