// DOM Elements
let noteForm, noteTitle, noteText, saveNoteBtn, newNoteBtn, clearBtn, noteList;

const isNotesPage = window.location.pathname === "/notes";

if (isNotesPage) {
  noteForm = document.querySelector(".note-form");
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  clearBtn = document.querySelector(".clear-btn");
  noteList = document.querySelectorAll(".list-container .list-group");
}

// Utility functions
const show = (elem) => (elem.style.display = "inline");
const hide = (elem) => (elem.style.display = "none");

let activeNote = {};

const apiRequest = (url, method, data) =>
  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

const getNotes = () => apiRequest("/api/notes", "GET");
const saveNote = (note) => (console.log(note), apiRequest("/api/notes", "POST", note));
const deleteNote = (id) => (console.log(`/api/notes/${id}`), apiRequest(`/api/notes/${id}`, "DELETE"));

// Render active note to form
const renderActiveNote = () => {
  const isReadOnly = !!activeNote.id;

  hide(saveNoteBtn);
  hide(clearBtn);

  noteTitle.readOnly = isReadOnly;
  noteText.readOnly = isReadOnly;
  noteTitle.value = activeNote.title || "";
  noteText.value = activeNote.text || "";

  if (!isReadOnly) show(newNoteBtn);
};

const handleNoteSave = () => {
  if (!noteTitle && !noteText) return;

  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };

  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

const handleNoteDelete = (e) => {
  e.stopPropagation();

  const noteId = JSON.parse(e.target.parentElement.getAttribute("data-note")).id;
  
  if (activeNote.id === noteId) activeNote = {};

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute("data-note"));
  renderActiveNote();
};

const handleNewNoteView = () => {
  activeNote = {};
  show(clearBtn);
  renderActiveNote();
};

const handleRenderBtns = () => {

  const isNoteEmpty = !noteTitle.value.trim() || !noteText.value.trim();

  if (isNoteEmpty) {
    hide(saveNoteBtn);
    hide(newNoteBtn);
    hide(clearBtn);
  } else {
    show(saveNoteBtn);
    show(clearBtn);
  }
};

const createLi = (text, delBtn = true) => {
  const liEl = document.createElement("li");
  liEl.classList.add("list-group-item");

  const spanEl = document.createElement("span");
  spanEl.classList.add("list-item-title");
  spanEl.innerText = text;
  spanEl.addEventListener("click", handleNoteView);

  liEl.append(spanEl);

  if (delBtn) {
    const delBtnEl = document.createElement("i");
    delBtnEl.classList.add("fas", "fa-trash-alt", "float-right", "text-danger", "delete-note");
    delBtnEl.addEventListener("click", handleNoteDelete);

    liEl.append(delBtnEl);
  }

  return liEl;
};

const renderNoteList = async (notes) => {
  const jsonNotes = await notes.json();

  if (isNotesPage) {
    noteList.forEach((el) => (el.innerHTML = ""));
  }

  const noteListItems = jsonNotes.length
    ? jsonNotes.map((note) => {
        const li = createLi(note.title);
        li.dataset.note = JSON.stringify(note);
        return li;
      })
    : [createLi("No saved Notes", false)];

  if (isNotesPage) {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (isNotesPage) {
  saveNoteBtn.addEventListener("click", handleNoteSave);
  newNoteBtn.addEventListener("click", handleNewNoteView);
  clearBtn.addEventListener("click", renderActiveNote);
  noteForm.addEventListener("input", handleRenderBtns);
  getAndRenderNotes();
  handleRenderBtns();
}
