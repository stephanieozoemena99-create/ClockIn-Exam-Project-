/* ============================================================
   ClockIn
   EMCICT311 Mini Project, Topic 8: Attendance Register

   FILE:   js/register.js
   LAYER:  2 of 4, the brain. All the rules live here.
   OWNER:  M4
   SERVES: add student names (3), search student names (3),
           count total present (3), count total absent (3),
           edit attendance record (3)

   This file holds the one array that the whole application is
   built on. Everything you see on screen is drawn from it, and
   nothing on screen is ever the truth by itself.

   Like student.js, this file knows nothing about buttons or
   colours. Every function here returns an answer. It never draws.
   ============================================================ */


class AttendanceRegister {

  constructor() {
    /* THE SINGLE SOURCE OF TRUTH.
       Every row on screen, every counter and every save reads from
       this one array. If this array is right, the app is right. */
    this.students = [];
  }


  /* ==========================================================
     ADDING
     ========================================================== */

  /* ----------------------------------------------------------
     addStudent
     IN  : name, the raw text the user typed
     OUT : { ok: true }
           { ok: false, message: "..." } if it was rejected

     Three gates must pass before anything is added. We check
     BEFORE changing the array, never after, so a rejected name
     can never leave the register half updated.
     ---------------------------------------------------------- */
  addStudent(name) {

    // trim() removes spaces from both ends, so a box containing
    // only spaces becomes "" and is correctly caught by gate 1.
    const clean = name.trim();

    // CONDITIONAL, gate 1: nothing was actually typed.
    if (clean === "") {
      return { ok: false, message: "Please type a student name" };
    }

    // CONDITIONAL, gate 2: a single letter is almost always a slip.
    if (clean.length < 2) {
      return { ok: false, message: "Name is too short" };
    }

    // CONDITIONAL, gate 3: this student is already on the list.
    if (this.nameExists(clean, null)) {
      return { ok: false, message: "That student is already on the list" };
    }

    // All three gates passed. Only now do we touch the data.
    this.students.push(new Student(clean));
    return { ok: true };
  }


  /* ==========================================================
     FINDING
     ========================================================== */

  /* ----------------------------------------------------------
     findById
     IN  : id, the hidden label carried by every button
     OUT : the matching Student, or null if there is no match

     Used by marking, editing and deleting. We search by id and
     never by position, because positions move. Delete somebody
     from the middle of the list and everybody below them shifts
     up. An id never moves.
     ---------------------------------------------------------- */
  findById(id) {

    // LOOP: walk the list one student at a time.
    for (let i = 0; i < this.students.length; i++) {

      // CONDITIONAL: stop as soon as we find the right one.
      if (this.students[i].id === id) {
        return this.students[i];
      }
    }

    // Nothing matched. Returning null lets the caller show a
    // message instead of crashing.
    return null;
  }


  /* ----------------------------------------------------------
     nameExists
     IN  : name, the name to check
           ignoreId, a student to skip, or null to check everybody
     OUT : true or false

     Comparison ignores capital letters, so "amaka obi" is
     correctly caught as the same person as "Amaka Obi".

     ignoreId exists for editing. When somebody opens a record and
     saves it without changing the spelling, we must not tell them
     their own name is taken. Passing their id skips their own row.
     ---------------------------------------------------------- */
  nameExists(name, ignoreId) {
    const target = name.trim().toLowerCase();

    // LOOP: compare against every student already on the list.
    for (let i = 0; i < this.students.length; i++) {
      const student = this.students[i];

      // CONDITIONAL: skip the student we were told to ignore.
      if (student.id === ignoreId) {
        continue;
      }

      // CONDITIONAL: a match, ignoring capitals.
      if (student.name.trim().toLowerCase() === target) {
        return true;
      }
    }

    return false;
  }


  /* ==========================================================
     EDITING AND DELETING
     ========================================================== */

  /* ----------------------------------------------------------
     editStudent
     IN  : id, which student
           newName, the corrected spelling
     OUT : { ok: true } or { ok: false, message: "..." }

     Only the name changes. The id and the Present or Absent mark
     are untouched, which is the whole point of the feature.
     ---------------------------------------------------------- */
  editStudent(id, newName) {
    const student = this.findById(id);

    // CONDITIONAL: the row is gone. Should not happen, but if we
    // did not check, the next line would crash the whole app.
    if (student === null) {
      return { ok: false, message: "Student not found" };
    }

    const clean = newName.trim();

    // CONDITIONAL: an empty name would wipe the record from view.
    if (clean === "") {
      return { ok: false, message: "Name cannot be empty" };
    }

    // CONDITIONAL: the name now belongs to somebody else.
    // We pass this student's own id so they may keep their own name.
    if (this.nameExists(clean, id)) {
      return { ok: false, message: "Another student already has that name" };
    }

    student.rename(clean);
    return { ok: true };
  }


  /* ----------------------------------------------------------
     deleteStudent
     IN  : id, which student
     OUT : true if one was removed, false if the id was not found

     splice(position, 1) removes exactly one item at that position.
     Not required by the marking scheme. It is here because it
     makes the live demo easier to control.
     ---------------------------------------------------------- */
  deleteStudent(id) {

    // LOOP: find the position of that id inside the array.
    for (let i = 0; i < this.students.length; i++) {

      // CONDITIONAL: this is the one.
      if (this.students[i].id === id) {
        this.students.splice(i, 1);
        return true;
      }
    }

    return false;
  }


  /* ==========================================================
     SEARCHING
     ========================================================== */

  /* ----------------------------------------------------------
     search
     IN  : term, whatever is currently in the search box
     OUT : a NEW array holding only the matching students

     Read the last line of this comment twice. This function never
     changes this.students and never saves anything. Searching is
     looking, not changing. If search ever wrote to storage, it
     would delete students, and it would look like a storage bug
     when it was really a search bug.
     ---------------------------------------------------------- */
  search(term) {
    const target = term.trim().toLowerCase();

    // CONDITIONAL: an empty box means no filter at all.
    // slice() hands back a copy, so the caller can never damage
    // the real list by accident.
    if (target === "") {
      return this.students.slice();
    }

    const matches = [];

    // LOOP: check every student's name for the typed fragment.
    for (let i = 0; i < this.students.length; i++) {
      const student = this.students[i];

      // CONDITIONAL: includes() is true when the name contains the
      // fragment anywhere, so "ama" finds "Amaka Obi".
      if (student.name.toLowerCase().includes(target)) {
        matches.push(student);
      }
    }

    return matches;
  }


  /* ==========================================================
     COUNTING

     None of these three numbers is ever stored. They are worked
     out again from the array every single time the screen is
     drawn. A stored total would be a second copy of the truth,
     and two copies eventually disagree.
     ========================================================== */

  /* ----------------------------------------------------------
     countTotal
     IN  : nothing
     OUT : a number
     ---------------------------------------------------------- */
  countTotal() {
    return this.students.length;
  }


  /* ----------------------------------------------------------
     countPresent
     IN  : nothing
     OUT : a number
     ---------------------------------------------------------- */
  countPresent() {
    let total = 0;

    // LOOP: walk every student once. (Section 4 loop requirement.)
    for (let i = 0; i < this.students.length; i++) {

      // CONDITIONAL: only present students are counted.
      if (this.students[i].status === "present") {
        total = total + 1;
      }
    }

    return total;
  }


  /* ----------------------------------------------------------
     countAbsent
     IN  : nothing
     OUT : a number

     Note that unmarked students are counted by neither this nor
     countPresent. That is correct. Present plus absent will not
     always equal the total, and it should not, because a student
     nobody has reached yet is neither.
     ---------------------------------------------------------- */
  countAbsent() {
    let total = 0;

    // LOOP: walk every student once.
    for (let i = 0; i < this.students.length; i++) {

      // CONDITIONAL: only absent students are counted.
      if (this.students[i].status === "absent") {
        total = total + 1;
      }
    }

    return total;
  }
}
