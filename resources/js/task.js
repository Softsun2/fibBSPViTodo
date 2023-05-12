/*
 * High Level Todo Abstraction
 */

import { getCol, getRow, setNCursor } from "./cursor.js";
import {
  addEditor,
  addFilter,
  removeEditor,
  getActiveEditor,
  updateDOM,
  displayTasks,
  updateEditorsTask,
  getActiveEditorIndex,
  setActiveEditor,
  unsetActiveEditor,
} from "./display.js";

/*********************************************************
 * Private Task
 ********************************************************/

const rootUrl = "http://localhost:3007/api/tasks";

/* updates a task object in the db */
async function updateTaskDB(task) {
  const headers = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ task: task }),
  };
  await fetch(rootUrl, headers);
}

/* inserts a task object into the db */
async function insertTaskDB(task) {
  const headers = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ task: task }),
  };
  await fetch(rootUrl, headers);
}

/* deletes a task object from db */
async function deleteTaskDB(id) {
  const headers = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({id: id}),
  };
  await fetch(rootUrl, headers);
}


/*********************************************************
 * Public Task
 ********************************************************/

/* gets task objects from db */
export async function getTasksDB(filter) {
  let url = rootUrl;
  if (filter) {
    url += "?" + new URLSearchParams({ key: filter.key, value: filter.value });
  }
  const tasks = await (await fetch(url)).json();
  return tasks;
}

/* task constructor, keys correspond to db column names */
export function Task({
  id = null,
  title = "# Title",
  description = "Description...",
  isDone = false,
}) {
  return {
    id: id,
    title: title,
    description: description,
    isDone: isDone,
  };
}

/* 
  * Displays a new task with default values. Not added to the db until
  * the editor's state is saved.
  */
export function newTask() {
  const task = Task({});
  addEditor(0, task);
  updateDOM();
}

/* 
  * Saves the task information to the database and redisplays the tasks.
  */
export function saveTask() {
  const editor = getActiveEditor();
  if (!editor) {
    return;
  }
  updateEditorsTask(editor);

  const preRow = getRow();
  const preCol = getCol();
  const index = getActiveEditorIndex();

  /* update existing task */
  if (editor.task.id) {
    /* have to redisplay tasks here due to filtering */
    updateTaskDB(editor.task).then( () => {
      displayTasks(index, preRow, preCol);
    });
  }
  /* insert task on first save */
  else {
    insertTaskDB(editor.task).then( () => {
      displayTasks(undefined, preRow, preCol);
    });
  }
}

/* 
  * Removes the task from the frontend and deletes it from the database.
  */
export function removeTask() {
  const editor = getActiveEditor();
  if (!editor) {
    return;
  }

  /* removes the active editor */
  removeEditor();
  
  /* remove task from the db */
  deleteTaskDB(editor.task.id).then( () => {
    updateDOM();
  });
}

/* 
  * Displays a filter editor, on selection the filtered tasks
  * will be displayed.
  */
export function filterTasks() {
  addFilter(0);
  updateDOM();
}

