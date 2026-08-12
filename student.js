/* ============================================================
   ClockIn
   EMCICT311 Mini Project, Topic 8: Attendance Register

   FILE:   js/student.js
   LAYER:  2 of 4, the brain.
   OWNER:  M4
   SERVES: mark Present / Absent (6 marks),
           edit attendance record (3 marks)

   This file describes ONE student and nothing else.

   It knows nothing about buttons, colours or the screen. You
   could delete the entire interface and everything in this file
   would still be correct. That is deliberate: it is what lets us
   test the rules without opening the app.
   ============================================================ */


/* ------------------------------------------------------------
   A counter used to build unique ids.

   Two students really can both be called Amaka Obi, and names can
   be edited afterwards, so a name is no good as a label. We build
   the id from the current time plus this counter. The time alone
   is not quite enough, because two students added in the same
   millisecond would get the same number.
   ------------------------------------------------------------ */
let studentIdCounter = 0;


class Student {

  /* ----------------------------------------------------------
     constructor
     IN  : name, the cleaned name of one student
     OUT : a new Student

     Runs automatically whenever we write "new Student(...)".
     Every student starts life as "unmarked", never as absent,
     because nobody has checked them yet.
     ---------------------------------------------------------- */
  constructor(name) {
    studentIdCounter = studentIdCounter + 1;

    this.id       = "stu_" + Date.now() + "_" + studentIdCounter;
    this.name     = name;
    this.status   = "unmarked";   // one of: unmarked | present | absent
    this.markedAt = null;         // null until somebody marks them
  }


  /* ----------------------------------------------------------
     markPresent
     IN  : nothing
     OUT : nothing

     Marking somebody present who is already present is allowed
     and harmless. It simply refreshes the time, which is easier
     to explain than an error nobody needed.
     ---------------------------------------------------------- */
  markPresent() {
    this.status   = "present";
    this.markedAt = new Date().toISOString();
  }


  /* ----------------------------------------------------------
     markAbsent
     IN  : nothing
     OUT : nothing
     ---------------------------------------------------------- */
  markAbsent() {
    this.status   = "absent";
    this.markedAt = new Date().toISOString();
  }


  /* ----------------------------------------------------------
     rename
     IN  : newName, the corrected name
     OUT : nothing

     Edit exists because names get typed wrongly. Notice that this
     method touches ONLY the name. The id and the status are left
     exactly as they were, which is how a student keeps their
     Present mark after a spelling is corrected.
     ---------------------------------------------------------- */
  rename(newName) {
    this.name = newName;
  }


  /* ----------------------------------------------------------
     toPlainObject
     IN  : nothing
     OUT : a plain object holding the same four facts

     The browser's storage can only hold plain text, and it has no
     idea what a class is. So before saving we strip the class away
     and keep just the information. storage.js does the rebuilding
     on the way back in.
     ---------------------------------------------------------- */
  toPlainObject() {
    return {
      id:       this.id,
      name:     this.name,
      status:   this.status,
      markedAt: this.markedAt
    };
  }
}
