/*
 * Cursor Behavior
 */

import {
  getEditorRows,
  getEditorRow,
} from "./editor.js";
import {
  editors,
  getActiveEditor,
} from "./display.js";


/*********************************************************
 * Private Cursor
 ********************************************************/

function onIKeypress(event) {
  const {
    initialCol,
    initialTextLength,
    parentDiv,
  } = this;

  const afterCol =
    initialCol +
    /* not sure why this needs to be textContext here ? */
    /* innerText displays a newline when all the characters are deleted. */
    ((parentDiv.textContent.length) - initialTextLength);

  setCol(afterCol);
}


/*********************************************************
 * Public Cursor
 ********************************************************/

export function setCol(col) {
  const editor = getActiveEditor();
  if (editor) editor.col = col;
}
export function setRow(row) {
  const editor = getActiveEditor();
  if (editor) editor.row = row;
}
export function getCol() {
  const editor = getActiveEditor();
  if (editor) return editor.col;
}
export function getRow() {
  const editor = getActiveEditor();
  if (editor) return editor.row;
}

export function watchCaret(parentDiv) {
  const initialTextLength = parentDiv.innerText.length;
  parentDiv.addEventListener(
    "keyup",
    /* some ever so dubious javascript */
    onIKeypress.bind({
      initialCol: getCol(),
      initialTextLength: initialTextLength,
      parentDiv: parentDiv,
    })
  );
}

export function unwatchCaret(parentDiv) {
  parentDiv.removeEventListener("keyup", onIKeypress);
}

/* Code reused from Geeks For Geeks post:
 * https://www.geeksforgeeks.org/how-to-set-cursor-position-in-content-editable-element-using-javascript/ */ 
export function setInsertCursor(element, pos) {
  const setpos = document.createRange();
  const set = window.getSelection();
  setpos.setStart(element.childNodes[0], pos);
  setpos.collapse();
  set.removeAllRanges();
  set.addRange(setpos);
  element.focus();
}


export function setNCursor(row, col, updateCol) {
  const targetRow = getEditorRow(row);

  if (targetRow) {
    const text = targetRow.innerText;
    if (col >= text.length) col = text.length - 1;
    if (col >= 0 && col <= text.length - 1) {
      setRow(row);
      if (updateCol) {
        setCol(col);
      }
      removeNCursor();
      insertCursor(targetRow, col);
    }
  }
}

/* inserts the cursor span at the indexth character of the element */
export function insertCursor(element, index) {
  const text = element.innerText;

  /* this won't throw an index out of bounds exception */
  const prefix = text.slice(0, index);
  const cursorChar = text.slice(index, index+1);
  const suffix = text.slice(index+1, text.length);

  element.innerHTML = `
    ${prefix}<span id="nCursor">${cursorChar}</span>${suffix}
  `;
}

export function getNCursor() {
  return document.getElementById("nCursor");
}


export function removeNCursor() {
  const cursor = getNCursor();
  if (cursor) {
    const parentDiv = cursor.parentElement;
    parentDiv.innerHTML = parentDiv.innerText;
  }
}


export function moveNCursorCol(nCols) {
  if (!getActiveEditor()) return;

  setNCursor(getRow(), getCol() + nCols, true);
}


export function moveNCursorRow(nRows) { 
  if (!getActiveEditor()) return;

  const afterRow = getRow() + nRows;
  const targetRow = getEditorRow(afterRow);
  if (targetRow) {
    const targetRowMaxCol = targetRow.innerText.length - 1;
    /* jump to end of target row when current column is greater than
     * the length of the target row. */
    if (getCol() > targetRowMaxCol) {
      setNCursor(afterRow, targetRowMaxCol, false);
    }
    else {
      setNCursor(afterRow, getCol(), false);
    }
  }
}


export function moveICursorColNoDraw(nCols) { 
  const row = getEditorRow(getRow());
  if (row) {
    const afterCol = getCol() + nCols;
    /* need to be able to place insert cursor (caret) after last character */
    if (afterCol >= 0 && afterCol <= row.innerText.length) {
      setCol(getCol() + nCols);
    }
  }
}


export function moveICursorToStartNoDraw() { setCol(0); }


export function moveICursorToEndNoDraw() {
  const row = getEditorRow(getRow());
  if (row) {
    setCol(row.innerText.length);
  }
}


export function getNextWordCol() {
  const row = getEditorRow(getRow());
  if (!row) return;

  const col = getCol();
  const text = row.innerText;
  const searchText = text.substring(col + 1, text.length);
  const word = searchText.split(" ", 1); 
  if (word !== []) {
    return (col + word[0].length + 1) + 1;
  }
  else {
    return text.length - 1;
  }
}

export function getEndOfNextWordCol() {
  const row = getEditorRow(getRow());
  if (!row) return;

  const col = getCol();
  const text = row.innerText;
  const searchText = text.substring(col + 1, text.length);
  const delimCount = searchText.charAt(0) === " " ? 2 : 1;
  const word = searchText.split(" ", delimCount); 
  if (word !== []) {
    if (delimCount == 1) {
      return (col + word[delimCount - 1].length + 1) - 1;
    }
    else {
      return (col + word[delimCount - 1].length + 1);
    }
  }
  else {
    return text.length - 1;
  }
}

export function getLastWordCol() {
  const row = getEditorRow(getRow());
  if (!row) return;

  const col = getCol();
  const reverseText = row.innerText.split("").reverse().join("");
  const reverseCol = reverseText.length - 1 - col;
  const searchText = reverseText.substring(reverseCol + 1, reverseText.length);
  const delimCount = searchText.charAt(0) === " " ? 2 : 1;
  const word = searchText.split(" ", delimCount); 

  if (word !== []) {
    if (delimCount == 1) {
      return (
        reverseText.length -
        1 -
        (reverseCol + word[delimCount - 1].length + 1)
      ) + 1;
    }
    else {
      return (
        reverseText.length -
        1 -
        (reverseCol + word[delimCount - 1].length + 1)
      );
    }
  }
  else {
    return 0;
  }
}

