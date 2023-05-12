/*
 * Vim Motion Lexing
 */

import { Mode , Motions } from "./vi.js";


let currentSequence = "";
let fallbackTimeout = 150; /* this ideally would be configurable */

function isAMapping(sequence, mappings) {
  for (const key in mappings) {
    if (key === sequence) {
      return true;
    }
  }
  return false;
}
function startOfAMapping(sequence, mappings) {
  for (const key in mappings) {
    if (key.startsWith(sequence) && key !== sequence) {
      return true;
    }
  }
  return false;
}
function fallback(intialSequence, action) {
  console.log(`Falling back to ${intialSequence}?`);
  console.log(currentSequence);
  if (intialSequence === currentSequence) {
    action(); 
    currentSequence = "";
  }
}

function lexer(mode, char) {
  const sequence = currentSequence + char;
  const mappings = Motions[mode].mappings;
  const isAKeymap = isAMapping(sequence, mappings);
  const isAStart = startOfAMapping(sequence, mappings);
  const action = mappings[sequence];

  /* sequence is a sequence AND the start of another sequence,
   * wait and see if we should fallback to the original sequence. */
  if (isAKeymap && isAStart) {
    currentSequence = sequence;
    setTimeout(() => fallback(sequence, action), fallbackTimeout);
  }
  /* sequence is only a mapping */
  else if (isAKeymap) {
    action();
    currentSequence = "";
  }
  /* sequence is only a start of a mapping */
  else if (isAStart) {
    currentSequence = sequence;
  }
  /* sequence will not lead to a mapping */
  else {
    currentSequence = "";
  }
}


document.addEventListener("keydown", function(event) {
  /* normal mode calncelled for being problematic on twitter! */
  console.log(event.key);
  if (Mode === "normal") {
    event.preventDefault();
  }
  lexer(Mode, event.key);
});

