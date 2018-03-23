(function() {
    'use strict';

    function NotesService(Note, StorageService) {
        var NOT_FOUND = (-1);

        var nextId, notes;

        reset();

        return {
            get notes() { return notes; },
            get frontNote() { return this.getFrontNote(); },

            reset: reset,

            createNote: createNote,
            deleteNote: deleteNote,

            bringNoteToFront: bringNoteToFront,
            getNoteByPoint: getNoteByPoint,

            getFrontNote: getFrontNote,

            loadNotes: loadNotes,
            saveNotes: saveNotes
        };

        function reset() {
            nextId = 1;
            notes = [];
        }

        function createNote() {
            var note = new Note(nextId++);
            notes.push(note);

            bringNoteToFront(note);

            return note;
        }

        function deleteNote(noteOrId) {
            var noteIndex = getNoteIndex(noteOrId);

            if (noteIndex === NOT_FOUND) {
                return false;
            }
            else {
                notes.splice(noteIndex, 1);
                return true;
            }
        }

        function bringNoteToFront(noteOrId) {
            var note = getNote(noteOrId);
            if (note === null) {
                throw new Error('Cannot find note.');
            }

            var maxZIndex = getMaxZIndex();
            note.setZIndex(maxZIndex + 1);

            recomputeZIndexes();
        }

        function getMaxZIndex() {
            var note = getNoteWithMaxZIndex();

            if (note === null) {
                return (-1);
            }
            else {
                return note.zIndex;
            }
        }

        function getNoteWithMaxZIndex() {
             var maxZIndex = (-1),
                 maxZIndexNote = null;

            for (var i = 0; i < notes.length; i += 1) {
                if (notes[i].zIndex > maxZIndex) {
                    maxZIndexNote = notes[i];
                    maxZIndex = notes[i].zIndex;
                }
            }

            return maxZIndexNote;

        }

        function getFrontNote() {
            return getNoteWithMaxZIndex();
        }

        function recomputeZIndexes() {
            notes.sort(function(leftNote, rightNote) {
                return (leftNote.zIndex - rightNote.zIndex);
            });

            for (var i = 0; i < notes.length; i += 1) {
                notes[i].setZIndex(i + 1);
            }
        }

        function getNoteIndex(noteOrId) {
            var id = (angular.isNumber(noteOrId) ? noteOrId : noteOrId.id);

            for (var i = 0; i < notes.length; i += 1) {
                if (notes[i].hasId(id)) {
                    return i;
                }
            }

            return (-1);
        }

        function getNote(noteOrId) {
            var noteIndex = getNoteIndex(noteOrId);

            if (noteIndex === NOT_FOUND) {
                return null;
            }
            else {
                return notes[noteIndex];
            }
        }

        function getNoteByPoint(x, y) {
            var note = null;

            for (var i = 0; i < notes.length; i += 1) {
                if (notes[i].containsPoint(x, y) && (!note || (notes[i].zIndex >= note.zIndex))) {
                    note = notes[i];
                }
            }

            return note;
        }

        function loadNotes() {
            notes = StorageService.loadNotes();

            nextId = Math.max.apply(null, notes.map(function(n) { return n.id; }));
            nextId++;
        }

        function saveNotes() {
            StorageService.saveNotes(notes);
        }
    }

    NotesService.$inject = ['Note', 'StorageService'];

    angular
        .module('notesApp')
        .factory('NotesService', NotesService);

})();
