/* ============================================================
   ClockIn
   EMCICT311 Mini Project, Topic 8: Attendance Register

   FILE:   js/storage.js
   LAYER:  1 of 4, the memory.
   OWNER:  M5
   SERVES: save attendance using Local Storage (6 marks)

   This is the only part of ClockIn that survives closing the tab.

   Local Storage is a small notepad built into the browser. It can
   only hold plain text, so this file has two jobs: turn our list
   of students into text on the way out, and turn that text back
   into real students on the way in.

   Everything here stays on one laptop, in one browser. That is a
   real limitation of Local Storage and it is worth being able to
   say out loud, because a facilitator may well ask.
   ============================================================ */


class AttendanceStorage {

  constructor() {
    /* The name the register is filed under inside the browser.
       If you ever change this word, every previously saved
       register becomes invisible, because the app would be
       looking under a different name. */
    this.KEY = "attendanceData";
  }


  /* ----------------------------------------------------------
     save
     IN  : students, the whole array from the register
     OUT : nothing

     We save the WHOLE list every time, not just the part that
     changed. It sounds wasteful and it is not: a class register is
     a few hundred characters of text. What it buys us is that
     there is only one way to save, so there is only one place a
     saving bug can hide.
     ---------------------------------------------------------- */
  save(students) {

    // Step 1: strip the class away from each student, leaving
    // just the four facts. Text cannot carry actions, only
    // information, so the actions have to go.
    const plain = [];

    // LOOP: convert every student in turn.
    for (let i = 0; i < students.length; i++) {
      plain.push(students[i].toPlainObject());
    }

    // Step 2: JSON.stringify turns that list into one long line of
    // text, which is the only thing Local Storage will accept.
    try {
      localStorage.setItem(this.KEY, JSON.stringify(plain));
    } catch (error) {
      /* Saving can genuinely fail, for example if the browser is in
         a private window with storage switched off. We catch it so
         the app keeps working rather than freezing. The register
         simply will not survive a refresh in that situation. */
      console.error("ClockIn could not save the register:", error);
    }
  }


  /* ----------------------------------------------------------
     load
     IN  : nothing
     OUT : an array of real Student objects,
           or an empty array if there is nothing saved

     READ THIS PART CAREFULLY. It is the single most common crash
     in this kind of project, and it is the bug documented in our
     test log.

     What comes back out of storage is plain information with no
     actions attached. It looks like a student but it cannot DO
     anything. Calling markPresent() on it would fail, and the app
     would appear to break only after a refresh, which makes it
     look like a storage problem when it is really this.

     So before handing anything back, we rebuild every saved record
     into a proper Student, which restores its actions.
     ---------------------------------------------------------- */
  load() {
    const text = localStorage.getItem(this.KEY);

    // CONDITIONAL: nothing has ever been saved. This is the very
    // first visit, so we start with an empty register rather than
    // crashing.
    if (text === null) {
      return [];
    }

    let plain;

    // JSON.parse turns the text back into a list. If the saved text
    // was somehow damaged, parsing throws an error, so we catch it
    // and start fresh instead of leaving the app stuck.
    try {
      plain = JSON.parse(text);
    } catch (error) {
      console.error("ClockIn found damaged saved data and ignored it:", error);
      return [];
    }

    // CONDITIONAL: guard against something that is not a list.
    if (Array.isArray(plain) === false) {
      return [];
    }

    const students = [];

    // LOOP: rebuild each saved record into a real Student.
    for (let i = 0; i < plain.length; i++) {
      const saved = plain[i];

      // CONDITIONAL: skip anything without a name. A record with no
      // name cannot be displayed or edited, so it is not useful.
      if (!saved || typeof saved.name !== "string") {
        continue;
      }

      // THIS LINE IS THE FIX. Making a new Student gives the record
      // its actions back.
      const student = new Student(saved.name);

      /* The constructor generated a brand new id, so we overwrite it
         with the saved one. If we did not, every button on screen
         would be pointing at an id that no longer exists after a
         refresh, and nothing would respond. */
      student.id       = saved.id;
      student.status   = saved.status;
      student.markedAt = saved.markedAt;

      students.push(student);
    }

    return students;
  }
}
