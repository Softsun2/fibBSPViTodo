# fibBSPViTodo

csci4131

12/19/22

Peyton Okubo

okubo012

## Introduction
My todo web app fibBSPViTodo uses binary space partitioning in a fibonacci layout to display tasks, similar to layouts of common unix window managers such as DWM, BSPWM, and I3. The user can interact with the todo tasks Via a few basic Vi keymaps/motions. I only implemented a few of the basic Vi motions as the string manipulation espicially from html text became rather tedious.


## Rationale
My goal with this was to implement a simple but effective UI inspired by lightweight developer tools. There's a class of programmers who use development and productivity tools that decrease visual clutter and emphasize usage efficiency. I wanted to build a web app that would be familiar to this subset of developers.


## Usage
You'll need to know the implmented keymaps to use the todo list. The mouse is of no use here. I hope you're familiar with Vi motions :)

The concept of the app is simple. Tasks are shown in editors within a BSP fibonacci layout. Reverse ordered by creation time. The user may navigate within an editor with the basic Vi motions. The user may navigate between editors with the keymaps `J` and `K` (case sensitive).

### Launching / Structure
Requires the node modules `express`, `mysql`, and `pug`. Requires access to my mysql server, must be ran on a lab machine. Uses the same file structure as homework five.
```
$ node server.js
```
The server runs on port 3007. There is one rendered page, [http://localhost:3007/fibBSPViTodo](http://localhost:3007/fibBSPViTodo). [http://localhost:3007/](http://localhost:3007/) redirects to this page as well. The server communicates with the db over the endpoint [http://localhost:3007/fibBSPViTodo/api/\*](http://localhost:3007/fibBSPViTodo/api/). See [server.js](server.js) for implementation of routes.

### Use cases
Making and saving a new task.
1. Open a new task editor with `Alt Enter` (This is a sequnce, `Alt` key then `Enter` key).
2. Edit task title, description, done status with Vi motions.
3. Save the task by entering `w` in command mode (to enter command mode press `:` in normal mode). The newly saved editor will appear at the end of the task stack.

Deleting a task.
1. Navigate to the task editor that you wish to delete with `J` and `K`.
2. Delete the task with the command `delete` or `d`. The task will be removed from the db and the layout.

Selecting a filter
1. On *any* task editor, enter the command `filter` or `f`.
2. Use the Vi motions to place the cursor on the row corresponding to the filter you wish to select.
3. Press the enter key, the corresponding task editors will be displayed.

### Keymaps
Keys seperated by spaces denote a sequence of keypresses. `Enter`, `Ctrl`, `Alt`, and `Esc` all refer to the key and not the sequence of characters. For instance to exit insert mode with `Ctrl c`, you would press the `Control` key and then the `c` key.

Normal Mode
* `l`: Moves the cursor right.
* `h`: Moves the cursor left.
* `j`: Moves the cursor down.
* `k`: Moves the cursor up.
* `w`: Moves the cursor forward a word.
* `e`: Moves the cursor to the end of the next word.
* `b`: Moves the cursor back a word.
* `J`: Moves the focus to the next task editor.
* `K`: Moves the focus to the previous task editor.
* `Alt Enter`: Opens a new default task, the task is not added to the db until it is saved.
* `Enter`: Toggles or selects the row under the cursor if possible.
* `i`: Enters insert mode behind the cursor.
* `I`: Enters insert mode at the beginning of the line.
* `a`: Enters insert mode in front of the cursor.
* `A`: Enters insert mode at the end of the line.
* `:`: Enters command mode.

Insert Mode
* `Ctrl c`: Exits insert mode.
* `Esc`: Exits insert mode.

Command Mode
* `Enter`: Attempts to perform the action associated with the command written on the Vi command line (bottom of the editor, prepended with ":").
* `Escape`: Exits command mode.
* `Ctrl c`: Also exits command mode.

### Commands
Commands are entered in command mode on the Vi command line (bottom of the editor, prepended with ":").
* `w`: Saves the contents of the active task to the db.
* `delete`: Removes the tasks from the db.
* `d`: Same as `delete`.
* `filter`: Opens the filter editor.
* `f`: Same as `filter`.


## Extension
I ran out of time implementing this. I have other stuff I needed to do. Here's a list of what I'd expand upon if I had the time.
  * Padding?
    * I've never been good at css, I couldn't figure out how to offset positioning by padding/margins so I went with no padding. It sort of fits the minimalist look but it's not proper.
  * Support multiline field content.
  * Add a landing page.
  * In browser how to.
  * Implement more Vi motions.
  
