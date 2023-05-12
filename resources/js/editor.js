/*
 * Editor Behavior
 */

import {
  getRow,
  getCol,
  setNCursor,
  insertCursor,
} from "./cursor.js";
import {
  displayTasks,
  getActiveEditor,
  removeEditor,
} from "./display.js";


/*********************************************************
 * Private Editor
 ********************************************************/

/*
  * Creates a task field DOM element, used to create the task 
  * DOM element. Fields display task values.
  */
function TaskField(id, contentEditable, toggleable, text) {
  const taskField = document.createElement("div");
  taskField.id = id;
  taskField.classList.add("taskField");
  if (toggleable) {
    taskField.classList.add("toggleable");
  }

  const firstRow = document.createElement("div")
  firstRow.innerText = text;
  if (contentEditable) {
    firstRow.setAttribute("contentEditable", "true");
    firstRow.setAttribute("spellcheck", "false");
    firstRow.setAttribute("data-gramm", "false");
  }
  taskField.ariaDisabled = true;
  taskField.appendChild(firstRow);

  return taskField;
}

export function showViMode(mode) {
  const editor = getActiveEditor();
  if (!editor) return;
  if (editor.isFilterSelector) return;

  const viCmdLine = editor.editor.querySelector("#viCmdLine");
  if (!viCmdLine) return;

  const viMode = viCmdLine.querySelector("#viMode");
  viMode.innerText = mode;
}

function ViCmdLine() {
  const viCmdLine = document.createElement("div");
  viCmdLine.id = "viCmdLine";

  const viMode = document.createElement("span");
  viMode.id = "viMode";

  const viCmdPrefix = document.createElement("span");
  viCmdPrefix.id = "viCmdPrefix";

  const viCmd = document.createElement("span");
  viCmd.id = "viCmd";
  viCmd.setAttribute("contentEditable", "true");
  viCmd.setAttribute("spellcheck", "false");
  viCmd.setAttribute("data-gramm", "false");

  viCmdLine.appendChild(viMode);
  viCmdLine.appendChild(viCmdPrefix);
  viCmdLine.appendChild(viCmd);

  return viCmdLine;
}

/*
  * Creates a filter field DOM element, used to create the filter
  * DOM element. Similar to a task field.
  */
function FilterField(id, text) {
  const taskField = document.createElement("div");
  taskField.id = id;
  taskField.classList.add("filterField");
  taskField.classList.add("selectable");

  const firstRow = document.createElement("div")
  firstRow.innerText = text;

  taskField.appendChild(firstRow);

  return taskField;
}


/*********************************************************
 * Public Editor
 ********************************************************/

/* gets the row DOM elements of the editor */
export function getEditorRows() {
  const editor = document.getElementById("activeEditor");
  const fields = editor.childNodes;
  const rows = [];

  for (let i = 0; i < fields.length; i++) {
    // skip non task/filter field nodes
    if (
      !strInClassList("taskField", fields[i].classList) &&
      !strInClassList("filterField", fields[i].classList)
    ) {
      continue;
    }
    const fieldRows = fields[i].childNodes;
    for (let j = 0; j < fieldRows.length; j++) {
      rows.push(fieldRows[j]);
    }
  }

  return rows;
}

/* gets the indexth row DOM element of the editor */
export function getEditorRow(index) {
  const rows = getEditorRows();
  if (index >= 0 && index <= rows.length - 1) {
    return rows[index];
  }
}

/* Creates a editor DOM element. */
export function Editor(listEditor) {
  const editorContainer = document.createElement("div");
  editorContainer.className = "fibContainer";

  const editor = document.createElement("div");
  if (listEditor.isActive) {
    editor.id = "activeEditor";
  }
  editor.className = "editor";

  const task = listEditor.task;
  const titleField = TaskField("title", true, false, task.title);
  const descField = TaskField("description", true, false, task.description);

  const toggle = task.isDone ? "[X]" : "[ ]";
  const statusField = TaskField("isDone", false, true, `${toggle} Done`);
  const viCmdLine = ViCmdLine();

  editor.appendChild(titleField);
  editor.appendChild(descField);
  editor.appendChild(statusField);
  editor.appendChild(viCmdLine);

  editorContainer.appendChild(editor);

  return editorContainer;
}

/*
  * Creates a filter editor DOM element, the same as an editor but with
  * slightly different fields/ids/class names etc...
  */
export function Filter(filter, listEditor) {
  const editorContainer = document.createElement("div");
  editorContainer.className = "fibContainer";

  const editor = document.createElement("div");
  if (listEditor.isActive) {
    editor.id = "activeEditor";
  }
  editor.classList.add("editor");
  editor.classList.add("filterSelect");

  function getFilterInnerText(suffix) {
    if (filter.key === "isDone") {
      return (
        filter.value === "all" && suffix === "All" ||
        filter.value === 1 && suffix === "Done" ||
        filter.value === 0 && suffix === "UnDone"
      ) ? `[X] ${suffix}` : `[ ] ${suffix}`;
    }
  }

  const allField = FilterField("allFilter", getFilterInnerText("All"));
  const doneField = FilterField("doneFilter", getFilterInnerText("Done"));
  const undoneField = FilterField("undoneFilter", getFilterInnerText("UnDone"));

  editor.appendChild(allField);
  editor.appendChild(doneField);
  editor.appendChild(undoneField);

  editorContainer.appendChild(editor);

  return editorContainer;
}

export function theresNoEnd() {
  const editorContainer = document.getElementById("editorContainer");
  const theresNoEnd = document.createElement("div");
  theresNoEnd.id = "theresNoEnd";
  theresNoEnd.textContent = `
                     ▗▄▄▄▙████▙▄▄▖                    
                   ▗▟█▀▘▘        ▀▀█▄                 
                 ▗▟▀                ▀▙▖               
                ▟▛▘                  ▝█▖              
 ▄▄▄▄          ▟▘                     ▜▛              
██▀▀█▙        ▟▛                      ▐█              
█   ▜█▌    ▗█▐▛     ▗▖▖                █▌      ▄███▄▖ 
▙   ▐█▙▄▄▄▄██▝    ▜██▘█▖               ▜▙▖    ▐█▛  ▝▜▙
▙    ▜███▛▀▘        ▀▜██▘       ▗▄▟▛▙▄▄▖▝██▄▄▄█▛   ▗█▛
█▖     ▘                       ▝▀▀▜█▛▀▀   ▝▀▀▀▀    ▟█▘
▐▙▖                       ▄▖ ▄▖                  ▗██▘ 
 ▀▙▖               █▙                           ▟██▀  
  ▀█▙▄             ▀██▄▄▖         ▗  █▖       ▄██▛    
    ▀██▙▄▄▄          ▝▀▀████▛▜██▀████▀      ▄██▛▘     
      ▝▀████▙▙▌          ▝▜▜█▛▘           ▄▟█▀        
           ▘▘▀██                      ▖▄▟█▀▀          
               ▝▀█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▘▀▀▘▘              
                   ▝▀▀▀▀▀▀▀▀▀▀▀▀                      

                   There's no end.
  `;
  editorContainer.appendChild(theresNoEnd);
}

/* 
  * Rows with the class name toggleable may be toggled.
  * Toggleable rows are prepended with "[ ]" or "[X]" to denote their state.
  * This prefix is "toggled" here.
  */
export function toggleRow(row) {
  const text = row.innerText;
  let replaceChar;
  if (text.charAt(1) === ' ') {
    replaceChar = 'X';
  }
  else {
    replaceChar = ' ';
  }
  row.innerText =
    text.substring(0, 1) +
    replaceChar +
    text.substring(2, text.length);
  setNCursor(getRow(), getCol(), true);
}

/* 
  * Rows with the class name selectable may be selected.
  * Selectable rows are prepended with "[ ]" or "[X]" to denote their state.
  * When a row is selected the the filter editor is removed and tasks are
  * redisplayed with the updated filter.
  */
export function selectFilter(filter, row) {
  const text = row.innerText.substring(4, row.innerText.length);
  const key = "isDone";
  let value = "all";
  if (text === "Done") {
    value = 1;
  }
  else if (text === "UnDone") {
    value = 0;
  }
  filter.key = key;
  filter.value = value;

  removeEditor();
  displayTasks();
}

/* Returns the thruthiness of whether or not the provided str is in the
  * editor's classList. */
export function strInClassList(str, classList) {
  for (let i = 0; i < classList.length; i++) {
    if (classList[i] === str) {
      return true;
    }
  }
  return false;
}

