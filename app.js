/* ============================================================
   ClockIn
   EMCICT311 Mini Project, Topic 8: Attendance Register

   FILE:   js/app.js
   LAYER:  3 of 4, the wiring.
   OWNER:  M5
   SERVES: display attendance list (3), and it is the file that
           connects every other requirement to a button

   This file is the translator between a person and the data. It
   listens for clicks, asks register.js to do the actual thinking,
   asks storage.js to save the result, then redraws the screen.

   It contains no rules of its own. If you find yourself writing an
   "if the name is empty" test in this file, it belongs in
   register.js instead.

   THE GOLDEN RULE, IN CODE
   The list is the truth. The screen is only a photograph of it.
   After anything changes we wipe the list area completely and draw
   it again from the array. We never reach in and change one row by
   hand, because then the screen and the data could disagree.
   ============================================================ */


/* ------------------------------------------------------------
   THE THREE THINGS THE APP IS BUILT ON
   ------------------------------------------------------------ */
const register = new AttendanceRegister();   // the rules and the data
const storage  = new AttendanceStorage();    // saving and loading


/* ------------------------------------------------------------
   SCREEN STATE
   These two describe what the screen is doing, not what the
   register contains. Neither is ever saved, because neither is
   part of the attendance record.
   ------------------------------------------------------------ */
let editingId  = null;   // which row is open for editing, null for none
let searchTerm = "";     // what is currently typed in the search box


/* ------------------------------------------------------------
   THE PAGE ELEMENTS
   Found once at startup rather than on every redraw. These names
   must match the ids in index.html exactly.
   ------------------------------------------------------------ */
const el = {
  addForm:      document.getElementById("addForm"),
  nameInput:    document.getElementById("nameInput"),
  message:      document.getElementById("message"),
  countTotal:   document.getElementById("countTotal"),
  countPresent: document.getElementById("countPresent"),
  countAbsent:  document.getElementById("countAbsent"),
  searchInput:  document.getElementById("searchInput"),
  studentList:  document.getElementById("studentList"),
  emptyState:   document.getElementById("emptyState"),
  noResults:    document.getElementById("noResults"),
  lectureDate:  document.getElementById("lectureDate")
};


/* The word shown inside the coloured tag, for each of the three
   statuses. Kept in one place so the wording cannot drift. */
const BADGE_LABEL = {
  present:  "Present",
  absent:   "Absent",
  unmarked: "Unmarked"
};

/* The four buttons on every normal row, in the order they appear.
   Building them from a list means adding a fifth button later is a
   one line change rather than four. */
const ROW_ACTIONS = [
  { action: "present", label: "Present" },
  { action: "absent",  label: "Absent"  },
  { action: "edit",    label: "Edit"    },
  { action: "delete",  label: "Delete"  }
];


/* ============================================================
   DRAWING
   ============================================================ */

/* ----------------------------------------------------------
   render
   IN  : nothing
   OUT : nothing

   The ONE redraw in the whole application. Nothing else is
   allowed to draw. Every action ends here.
   ---------------------------------------------------------- */
function render() {
  // Search filters a COPY. The real register is untouched.
  const visible = register.search(searchTerm);

  renderList(visible);
  renderCounters();
}


/* ----------------------------------------------------------
   renderList
   IN  : list, the students that should be visible right now
   OUT : nothing

   Wipes the list area and builds it again from scratch.
   ---------------------------------------------------------- */
function renderList(list) {

  // Wipe. This also removes the four sample rows that sit in
  // index.html so the page can be styled before this file exists.
  el.studentList.innerHTML = "";

  // CONDITIONAL: the register is genuinely empty.
  if (register.countTotal() === 0) {
    el.emptyState.classList.remove("is-hidden");
    el.noResults.classList.add("is-hidden");
    return;
  }

  // CONDITIONAL: there are students, but none match the search.
  // This is a different situation from an empty register, so it
  // gets a different message.
  if (list.length === 0) {
    el.noResults.classList.remove("is-hidden");
    el.emptyState.classList.add("is-hidden");
    return;
  }

  el.emptyState.classList.add("is-hidden");
  el.noResults.classList.add("is-hidden");

  // LOOP: build one row per visible student.
  for (let i = 0; i < list.length; i++) {
    const student = list[i];

    // CONDITIONAL: this is the row the user opened for editing.
    if (student.id === editingId) {
      el.studentList.appendChild(buildEditRow(student));
    } else {
      el.studentList.appendChild(buildRow(student));
    }
  }
}


/* ----------------------------------------------------------
   renderCounters
   IN  : nothing
   OUT : nothing

   The three numbers are worked out fresh every time, never
   stored and never adjusted by hand.

   Note that they are read from the REGISTER, not from the
   filtered list. Searching for one student must not make the
   class total drop to one.
   ---------------------------------------------------------- */
function renderCounters() {
  el.countTotal.textContent   = register.countTotal();
  el.countPresent.textContent = register.countPresent();
  el.countAbsent.textContent  = register.countAbsent();
}


/* ----------------------------------------------------------
   buildRow
   IN  : student
   OUT : one finished <li> element

   Built piece by piece with createElement, and the name is put in
   with textContent. That matters: textContent treats a name as
   plain text, so a student called "<b>Ada</b>" shows exactly that
   instead of being treated as page code.
   ---------------------------------------------------------- */
function buildRow(student) {
  const row = document.createElement("li");
  row.className = "student-row";
  row.dataset.id = student.id;

  const badge = document.createElement("span");
  badge.className = "badge badge--" + student.status;
  badge.textContent = BADGE_LABEL[student.status];

  const name = document.createElement("span");
  name.className = "student-name";
  name.textContent = student.name;

  const actions = document.createElement("div");
  actions.className = "row-actions";

  // LOOP: build the four buttons.
  for (let i = 0; i < ROW_ACTIONS.length; i++) {
    const spec = ROW_ACTIONS[i];

    const button = document.createElement("button");
    button.className = "btn-mini btn-mini--" + spec.action;
    button.textContent = spec.label;

    // Every button carries the student's id and what it does.
    // This is how one listener can serve every button on screen.
    button.dataset.action = spec.action;
    button.dataset.id     = student.id;

    actions.appendChild(button);
  }

  row.appendChild(badge);
  row.appendChild(name);
  row.appendChild(actions);
  return row;
}


/* ----------------------------------------------------------
   buildEditRow
   IN  : student
   OUT : one finished <li> in edit mode

   The name becomes a text box, and the four buttons become Save
   and Cancel. Only one row can be in this state at a time.
   ---------------------------------------------------------- */
function buildEditRow(student) {
  const row = document.createElement("li");
  row.className = "student-row student-row--editing";
  row.dataset.id = student.id;

  // A label every screen reader announces but nobody sees.
  const label = document.createElement("label");
  label.className = "visually-hidden";
  label.setAttribute("for", "editInput-" + student.id);
  label.textContent = "Edit student name";

  const input = document.createElement("input");
  input.className = "edit-input";
  input.type = "text";
  input.id = "editInput-" + student.id;
  input.value = student.name;

  const actions = document.createElement("div");
  actions.className = "row-actions";

  const save = document.createElement("button");
  save.className = "btn-mini btn-mini--save";
  save.textContent = "Save";
  save.dataset.action = "save";
  save.dataset.id = student.id;

  const cancel = document.createElement("button");
  cancel.className = "btn-mini btn-mini--cancel";
  cancel.textContent = "Cancel";
  cancel.dataset.action = "cancel";
  cancel.dataset.id = student.id;

  actions.appendChild(save);
  actions.appendChild(cancel);

  row.appendChild(label);
  row.appendChild(input);
  row.appendChild(actions);
  return row;
}


/* ============================================================
   MESSAGES
   Every message in the app appears in one fixed place, so an
   error never pushes the rest of the page around.
   ============================================================ */

function showError(message) {
  el.message.textContent = message;
  el.message.className = "message message--error";
}

function clearMessage() {
  el.message.textContent = "";
  el.message.className = "message is-hidden";
}


/* ----------------------------------------------------------
   saveAndRender
   IN  : nothing
   OUT : nothing

   Steps 4 and 5 of the golden rule, kept together in one place so
   that nobody can change the data and then forget to save it, or
   save it and forget to redraw.

   Call this after ANY change to the register. Never call it after
   a search, because searching changes nothing.
   ---------------------------------------------------------- */
function saveAndRender() {
  storage.save(register.students);
  render();
}


/* ============================================================
   LISTENING
   ============================================================ */

/* ----------------------------------------------------------
   bindEvents
   IN  : nothing
   OUT : nothing

   Attaches every listener. Runs once at startup.
   ---------------------------------------------------------- */
function bindEvents() {

  /* --- ADD A STUDENT ---------------------------------------
     Listening to the form rather than the button means the Enter
     key works for free, so a lecturer can type a name, press
     Enter, and keep typing without touching the mouse.

     preventDefault stops the browser reloading the page, which is
     what a form normally does.
     -------------------------------------------------------- */
  el.addForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const result = register.addStudent(el.nameInput.value);

    // CONDITIONAL: one of the three gates rejected the name.
    // Nothing was saved and nothing was added.
    if (result.ok === false) {
      showError(result.message);
      return;
    }

    clearMessage();
    saveAndRender();

    // Empty the box and put the cursor back, ready for the next name.
    el.nameInput.value = "";
    el.nameInput.focus();
  });


  /* --- SEARCH ----------------------------------------------
     Fires on every keystroke. Notice it calls render() and NOT
     saveAndRender(), because searching is looking, not changing.
     -------------------------------------------------------- */
  el.searchInput.addEventListener("input", function () {
    searchTerm = el.searchInput.value;
    render();
  });


  /* --- EVERY BUTTON INSIDE THE LIST ------------------------
     One listener for the whole list, instead of attaching four
     listeners to every row and having to reattach them on every
     redraw. The listener reads which button was clicked from the
     data-action and data-id it carries.
     -------------------------------------------------------- */
  el.studentList.addEventListener("click", function (event) {

    // closest() walks up from whatever was clicked until it finds
    // a button, so a click still works if it lands on the text.
    const button = event.target.closest("button[data-action]");

    // CONDITIONAL: the click was not on a button. Ignore it.
    if (button === null) {
      return;
    }

    handleRowAction(button.dataset.action, button.dataset.id);
  });


  /* --- KEYBOARD INSIDE AN EDIT BOX -------------------------
     Enter saves, Escape cancels. Small touch, but editing a
     spelling should not require reaching for the mouse.
     -------------------------------------------------------- */
  el.studentList.addEventListener("keydown", function (event) {

    if (event.target.classList.contains("edit-input") === false) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleRowAction("save", editingId);
    }

    if (event.key === "Escape") {
      handleRowAction("cancel", editingId);
    }
  });
}


/* ----------------------------------------------------------
   handleRowAction
   IN  : action, one of present | absent | edit | save | cancel | delete
         id, which student it belongs to
   OUT : nothing

   Every row button in the app arrives here.
   ---------------------------------------------------------- */
function handleRowAction(action, id) {

  /* Cancel is handled before the lookup, because it only closes
     the edit box and does not need the student at all. */
  if (action === "cancel") {
    editingId = null;
    clearMessage();
    render();
    return;
  }

  const student = register.findById(id);

  // CONDITIONAL: no student with that id. Should not happen, but
  // checking means a stale button cannot crash the app.
  if (student === null) {
    showError("Student not found");
    return;
  }

  if (action === "present") {
    student.markPresent();
    clearMessage();
    saveAndRender();
    return;
  }

  if (action === "absent") {
    student.markAbsent();
    clearMessage();
    saveAndRender();
    return;
  }

  if (action === "edit") {
    // Opening the edit box changes no data, so we redraw without
    // saving anything.
    editingId = id;
    clearMessage();
    render();
    return;
  }

  if (action === "save") {
    const input = document.getElementById("editInput-" + id);

    if (input === null) {
      return;
    }

    const result = register.editStudent(id, input.value);

    // CONDITIONAL: the new name was rejected. We stay in edit mode
    // on purpose, so the user does not lose what they typed.
    if (result.ok === false) {
      showError(result.message);
      return;
    }

    editingId = null;
    clearMessage();
    saveAndRender();
    return;
  }

  if (action === "delete") {
    /* Delete is the only action that destroys information
       permanently, so it is the only one that asks first.
       Confirmations on reversible actions just train people to
       click through without reading. */
    const sure = window.confirm("Remove " + student.name + " from the register?");

    if (sure === false) {
      return;
    }

    // If the deleted row happened to be open for editing, close it.
    if (editingId === id) {
      editingId = null;
    }

    register.deleteStudent(id);
    clearMessage();
    saveAndRender();
  }
}


/* ============================================================
   STARTING UP
   ============================================================ */

/* ----------------------------------------------------------
   formatToday
   IN  : nothing
   OUT : today's date as readable text

   Written into the header so a screenshot of the register is
   self explanatory about which lecture it belongs to.
   ---------------------------------------------------------- */
function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric"
  });
}


/* ----------------------------------------------------------
   start
   The first thing that runs. This is the fork at the top of the
   user flow graph: load whatever was saved, then draw it. On a
   first ever visit load() hands back an empty list, so the app
   opens cleanly into the empty state instead of crashing.
   ---------------------------------------------------------- */
function start() {
  el.lectureDate.textContent = formatToday();

  register.students = storage.load();

  bindEvents();
  render();

  el.nameInput.focus();
}

start();
