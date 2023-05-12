/*
 * Vim State and Motions
 */

/* coupling go brrrrr */

import {
  toggleRow,
  selectFilter,
  getEditorRow,
  strInClassList,
  showViMode,
} from "./editor.js";
import {
  getRow,
  getCol,
  watchCaret,
  unwatchCaret,
  getNCursor,
  setNCursor,
  setInsertCursor,
  moveNCursorCol,
  moveNCursorRow,
  moveICursorColNoDraw,
  moveICursorToStartNoDraw,
  moveICursorToEndNoDraw,
  removeNCursor,
  setCol,
  getNextWordCol,
  getLastWordCol,
  getEndOfNextWordCol,
} from "./cursor.js";
import {
  getActiveEditorIndex,
  setActiveEditor,
  unsetActiveEditor,
  validBounds,
  updateDOM,
  filter,
  getActiveEditor,
} from "./display.js";
import {
  newTask,
  saveTask,
  removeTask,
  filterTasks,
} from "./task.js";


/*********************************************************
 * Globals
 ********************************************************/

/* current vim mode */
export let Mode = "normal";

/* 
  * Intialization of the vim motions. Toplevel objects are vim modes. Mode
  * identifier is displayed by the vimline. The associated hook is called on
  * setting the mode. Each mode has a list of mappings which are input
  * sequnce action pairs. Where the input sequence is a keyboard input
  * sequence and the associated action on that sequence.
  *
  * Hooks and key mappings are assigned later in the file.
  */
export let Motions = {
  normal: {
    identifier: "", 
    hook: null,
    mappings : {

    }
  },
  insert: {
    identifier: "-- INSERT --", 
    hook: null,
    mappings : {

    }
  },
  visual: {
    identifier: "-- VISUAL --", 
    hook: null,
    mappings : {

    }
  },
  visualBlock: {
    identifier: "-- VISUAL BLOCK --", 
    hook: null,
    mappings : {

    }
  },
  command: {
    identifier: "", 
    hook: null,
    mappings : {
    },
    commands : {
    }
  },
}


/*********************************************************
 * Setters
 ********************************************************/


/*
  * set a hook
  * afterMode: vim mode
  */
function setMode(mode) {
  if (Motions[mode].hook(Mode)) {
    Mode = mode;
  }
}

/*
  * set a hook
  * mode: vim mode
  * result: the mode action
  */
function setHook(mode, hook) {
  Motions[mode].hook = hook;
}

function setCommand(command, action) {
  Motions.command.commands[command] = action;
}

/*
  * set a keymapping
  * mode: vim mode
  * sequence: keyboard sequence
  * action: the mapping action 
  */
function keymap(mode, sequence, action) {
  const mappings = Motions[mode].mappings;
  mappings[sequence] = action;
}
function nkeymap(sequence, action) {
  keymap("normal", sequence, action);
}
function ikeymap(sequence, action) {
  keymap("insert", sequence, action);
}
function vkeymap(sequence, action) {
  keymap("visual", sequence, action);
}
function vbkeymap(sequence, action) {
  keymap("visualBlock", sequence, action);
}
function ckeymap(sequence, action) {
  keymap("command", sequence, action);
}

/*********************************************************
 * Mode Hooks
 ********************************************************/

function onInsertMode(lastMode) {
  let modeChange = true;
  if (lastMode == "normal") {
    const cursor = getNCursor();
    const parentDiv = cursor.parentElement;
    const contentEditable = parentDiv.getAttribute("contentEditable");
    if (contentEditable) {
      removeNCursor();
      if (parentDiv.innerText === "\u00A0") {
        setCol(0);
        setInsertCursor(parentDiv, 0);
        parentDiv.innerText = "";
      }
      else {
        setInsertCursor(parentDiv, getCol());
      }
      watchCaret(parentDiv);
      showViMode(Motions["insert"].identifier);
    }
    else {
      modeChange = false;
    }
  }
  return modeChange;
}

function onNormalMode(lastMode) {
  let modeChange = true;
  if (lastMode == "insert") {
    const col = getCol();
    const row = getRow();
    const focused = document.activeElement;
    focused.blur();
    const afterCol = col - 1 < 0 ? 0 : col - 1;
    const editedRow = getEditorRow(row);
    if (editedRow.innerText == "\n" || editedRow.innerText == "") {
      /* more cursed code, ref: */
      /* https://dirask.com/posts/JavaScript-no-break-non-breaking-space-in-string-jMwzxD */
      editedRow.innerText= "\u00A0";
    }
    setNCursor(row, afterCol, true);
    unwatchCaret(focused);
    showViMode(Motions["normal"].identifier);
  }
  else if (lastMode == "command") {
    const editor = getActiveEditor();
    if (!editor) return;
    const viCmdPrefix = editor.editor.querySelector("#viCmdPrefix");
    viCmdPrefix.innerText = "";
    const viCmd = editor.editor.querySelector("#viCmd");
    viCmd.innerText = "";

    const focused = document.activeElement;
    focused.blur();

    setNCursor(getRow(), getCol(), true);
    showViMode(Motions["normal"].identifier);
  }
  return modeChange;
}

function onCommandMode(lastMode) {
  let modeChange = true;
  if (lastMode == "normal") {
    const editor = getActiveEditor();
    if (!editor) return;
    
    removeNCursor();

    const viCmdPrefix = editor.editor.querySelector("#viCmdPrefix");
    viCmdPrefix.innerText = ":";
    const viCmd = editor.editor.querySelector("#viCmd");
    viCmd.focus();
  }
  return modeChange;
}


/*********************************************************
 * Set Hooks
 ********************************************************/

setHook("normal", onNormalMode);
setHook("insert", onInsertMode);
setHook("command", onCommandMode );
setHook("visual", () => console.log("visual mode hook") );
setHook("visualBlock", () => console.log("visualBlock mode hook") );

/*********************************************************
 * Set Commands
 ********************************************************/

setCommand("w", saveTask);

setCommand("d", removeTask);
setCommand("delete", removeTask);

setCommand("f", filterTasks);
setCommand("filter", filterTasks);


/*********************************************************
 * Normal Mode Keymaps
 ********************************************************/

/* motions */
nkeymap("l", () => moveNCursorCol(1) );
nkeymap("h", () => moveNCursorCol(-1) );
/* TODO: moveNCursorRow needs to be more nuanced */
nkeymap("j", () => moveNCursorRow(1) );
nkeymap("k", () => moveNCursorRow(-1) );

nkeymap("w", () => {
  const col = getNextWordCol();
  setNCursor(getRow(), col, true);
});
nkeymap("e", () => {
  const col = getEndOfNextWordCol();
  setNCursor(getRow(), col, true);
});
nkeymap("b", () => {
  const col = getLastWordCol();
  setNCursor(getRow(), col, true);
});

nkeymap("J", () => {
  const activeEditorIndex = getActiveEditorIndex();
  if (validBounds(activeEditorIndex + 1)) {
    unsetActiveEditor();
    setActiveEditor(activeEditorIndex + 1);
    updateDOM();
  }
});
nkeymap("K", () => {
  const activeEditorIndex = getActiveEditorIndex();
  if (validBounds(activeEditorIndex - 1)) {
    unsetActiveEditor();
    setActiveEditor(activeEditorIndex - 1);
    updateDOM();
  }
});
nkeymap("AltEnter", newTask);

/* toggling */
nkeymap("Enter", () => {
  if (!getActiveEditor()) return;

  const row = getEditorRow(getRow());
  const parentDiv = row.parentElement;
  if (strInClassList("toggleable", parentDiv.classList)) {
    toggleRow(row);
  }
  else if (strInClassList("selectable", parentDiv.classList)) {
    selectFilter(filter, row);
  }

  setMode("normal");
});

/* mode changing */
nkeymap(":", () => setMode("command"));
nkeymap("i", () => {
  if (!getActiveEditor()) return;
  setMode("insert")
});
nkeymap("I", () => {
  if (!getActiveEditor()) return;
  const row = getEditorRow(getRow());
  const editable = row.getAttribute("contentEditable");
  if (editable) {
    moveICursorToStartNoDraw();
    setMode("insert");
  }
});
nkeymap("a", () => {
  if (!getActiveEditor()) return;
  const row = getEditorRow(getRow());
  const editable = row.getAttribute("contentEditable");
  if (editable) {
    moveICursorColNoDraw(1);
    setMode("insert");
  }
});
nkeymap("A", () => {
  if (!getActiveEditor()) return;
  const row = getEditorRow(getRow());
  const editable = row.getAttribute("contentEditable");
  if (editable) {
    moveICursorToEndNoDraw();
    setMode("insert");
  }
});


/*********************************************************
 * Insert Mode Keymaps
 ********************************************************/

/* mode changing */
ikeymap("Controlc", () => setMode("normal") );
ikeymap("Escape", () => setMode("normal") );


/*********************************************************
 * Command Mode Keymaps
 ********************************************************/

ckeymap("Enter", () => {
  const editor = getActiveEditor();
  if (!editor) return;

  const viCmd = editor.editor.querySelector("#viCmd");
  if (!viCmd) return;

  const cmd = viCmd.innerText;
  const action = Motions.command.commands[cmd];
  if (action) {
    action();
  }

  setMode("normal");
});
ckeymap("Escape", () => setMode("normal") );
ckeymap("Controlc", () => setMode("normal") );

