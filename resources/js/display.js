/*
 * Displays and manages editors with binary space partitioning
 * in a fibonacci layout.
 *
 * This file probably has too much unrelated functionality.
 */


import {
  setNCursor,
} from "./cursor.js";
import {
  getTasksDB,
} from "./task.js";
import {
  strInClassList,
  Editor,
  Filter,
  theresNoEnd,
} from "./editor.js";


/*********************************************************
 * Private
 ********************************************************/

/* I'm certain there's a more elegant recursive or constant
  * time solution but this works.
  *
  * This returns three variables:
  * direction: the flex direction to assign the editor's container
  * width: the percentage of the width of the indexth editor
  * height: the percentage of the height of the indexth editor
  * 
  * At a high level this returns the styling information in order to display
  * the editors in a fibonacci bsp layout according to the chosen DOM 
  * structure. This function does NOT generalize. */
function fibbonacciBSP(index) {
  const direction = index % 2 == 0 ? "row" : "column";
  let width = 100;
  let height = 100;

  for (let i = 0; i < index + 1; i++) {
    if (i % 2 == 0) {
      width /= 2;
    }
    else if ((i + 1) % 2 == 0) {
      height /= 2;
    }
  }

  if (index == editors.length - 1) {
    if (direction == "row") {
      width *= 2;
    }
    else {
      height *= 2;
    }
  }

  return {
    direction: direction,
    width: width,
    height: height,
  };
}


/*********************************************************
 * Public
 ********************************************************/

export let editors = [];
export let filter = { key: "isDone", value: "all" };

export function getActiveEditorIndex() {
  for (let i = 0; i < editors.length; i++) {
    if (editors[i].isActive) {
      return i;
    }
  }
}

export function getActiveEditor() {
  const activeEditorIndex = getActiveEditorIndex();
  if (typeof activeEditorIndex == "number") {
    return editors[activeEditorIndex];
  }
}

export function validBounds(index) {
  return index >= 0 && index <= editors.length - 1;
}

export function setActiveEditor(index) {
  if (validBounds(index)) {
    const listEditor = editors[index];
    listEditor.isActive = true;
  }
}

export function unsetActiveEditor() {
  for (let i = 0; i < editors.length; i++) {
    if (editors[i].isActive) {
      const listEditor = editors[i];
      listEditor.isActive = false;
      return;
    }
  }
}

/* spawns a new editor */
export function spawnEditor(index) {
  /* add to editor list */
  if (!validBounds(index)) {
    return;
  }
  const listEditor = editors[index];

  /* make new DOM element */
  let editorContainer;
  if (listEditor.isFilerSelector) {
    editorContainer = Filter(filter, editors[index]);
  }
  else {
    editorContainer = Editor(editors[index]);
  }
  const editor = editorContainer.children[0];

  /* update list editor */
  listEditor.editor = editorContainer;

  /* apply layout styling */
  const { direction, width, height } = fibbonacciBSP(index);
  editorContainer.style.display = "flex";
  editorContainer.style["flex-direction"] = direction;
  editor.style.width = `${width}vw`;
  editor.style.height = `${height}vh`;

  /* get parent DOM element */
  let lastContainer;
  if (index == 0) {
    lastContainer = document.getElementById("editorContainer");
  }
  else {
    lastContainer = editors[index - 1].editor;
  }

  /* add editor to DOM */
  lastContainer.appendChild(editorContainer);
}

export function updateDOM() {
  /* clear DOM */
  const editorContainer = document.getElementById("editorContainer");
  const editorElements = editorContainer.children[0];
  if (editorElements) {
    editorElements.remove();
  }

  if (editors.length == 0) {
    theresNoEnd();
  }

  /* build DOM */
  for (let i = 0; i < editors.length; i++) {
    spawnEditor(i);
  }

  /* set cursor */
  const listEditor = getActiveEditor();
  if (listEditor) {
    setNCursor(listEditor.row, listEditor.col, true);
  }
}

export function addEditor(index, task) {
  if (index >=0 && index <= editors.length) {
    unsetActiveEditor();

    const editorContainer = {
      editor: null,     /* dom element */
      isFilerSelector: false,
      isActive: null,   /* boolean, is editor the active editor */
      mode: "normal",   /* editor's vim mode */
      row: 0,           /* cursor row */
      col: 0,           /* cursor col */
      task: task,       /* editor's task */
    };
    editors.splice(index, 0, editorContainer);

    setActiveEditor(index);
  }
}

export function addFilter(index) {
  if (index >=0 && index <= editors.length) {
    unsetActiveEditor();

    const editorContainer = {
      editor: null,     /* dom element */
      isFilerSelector: true,
      isActive: null,   /* boolean, is editor the active editor */
      mode: "normal",   /* editor's vim mode */
      row: 0,           /* cursor row */
      col: 0,           /* cursor col */
      task: null,       /* editor's task */
    };
    editors.splice(index, 0, editorContainer);

    setActiveEditor(index);
  }
}

/* removes the active editor */
export function removeEditor() {
  const index = getActiveEditorIndex();
  let nextActiveIndex;
  
  if (index == editors.length - 1) {
    nextActiveIndex = index - 1; 
  }
  else {
    nextActiveIndex = index;
  }

  /* remove from editor list */
  editors =
    editors.slice(0, index).concat(
      editors.slice(index + 1, editors.length));

  /* set next editor as active */
  setActiveEditor(nextActiveIndex);
}

export function updateEditorsTask(editorContainer) {
  const task = editorContainer.task;
  const editor = editorContainer.editor.children[0];
  const fields = editor.children;

  for (let i = 0; i < fields.length; i++) {
    if (!strInClassList("taskField", fields[i].classList)) {
      continue;
    }
    
    const key = fields[i].id;
    let value = fields[i].innerText;

    /* conversion for isDone */
    if (strInClassList("toggleable", fields[i].classList)) {
      value = value.charAt(1) === 'X';
    }

    if (key in task) {    /* woah I like this */
      task[key] = value;
    }
  }
}

function setActiveEditorCursor(row, col) {
  const editor = getActiveEditor();
  if (!editor) return;
  editor.row = row;
  editor.col = col;
}

export async function displayTasks(activeIndex, row, col) {
  editors = [];

  const tasks = await getTasksDB(filter);

  for (let i = 0; i < tasks.length; i++) {
    addEditor(i, tasks[i]);
  }

  if (typeof(activeIndex) != "undefined") {
    unsetActiveEditor();
    setActiveEditor(activeIndex);
  }

  if (typeof(row) != "undefined" && typeof(col) != "undefined") {
    setActiveEditorCursor(row, col);
  }

  updateDOM();
}


/*********************************************************
 * Initialization
 ********************************************************/

displayTasks();

