document.addEventListener('DOMContentLoaded', function () {
    const inputAction = document.getElementById('input_section');
    inputAction.addEventListener('submit', function (event) {
        event.preventDefault();
        addInputs();
    });

    const inputBookIsComplete = document.getElementById('inputBookIsComplete');
    inputBookIsComplete.addEventListener('change', function () {
        const bookSubmitButton = document.getElementById('bookSubmit');
        bookSubmitButton.textContent = inputBookIsComplete.checked ? 'Masukkan Buku ke rak Selesai dibaca' : 'Masukkan Buku ke rak Belum selesai dibaca';
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const input of data) {
            inputs.push(input);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(inputs);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

const SAVED_EVENT = 'saved-inputs';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof(storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

isBookComplete = document.getElementById('inputBookIsComplete').checked;

function addInputs() {
    const inputJudul = document.getElementById('inputBookTitle').value;
    const inputPenulis = document.getElementById('inputBookAuthor').value;
    const inputYear = document.getElementById('inputBookYear');
    const inputTahun = parseInt(inputYear.value, 10)
    const inputIsComplete = document.getElementById('inputBookIsComplete').checked; 

    const generateID = generateId();

    const inputObject = generateInputObject(generateID, inputJudul, inputPenulis, inputTahun, false); 
    inputs.push(inputObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateInputObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}

const inputs = [];
const RENDER_EVENT = 'render-todo';

document.addEventListener(RENDER_EVENT, function () {
    console.log(inputs);
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const inputItem of inputs) {
        const inputElement = makeBookList(inputItem);
        if (!inputItem.isComplete) {
            incompleteBookshelfList.append(inputElement);
        } else {
            completeBookshelfList.append(inputElement);
        }
    }
});

function makeBookList(inputObject) {
    const div = document.createElement('div');
    div.setAttribute('id', `${inputObject.id}`);
    div.className = 'book_item';
    div.innerHTML += '<h2>' + inputObject.title + '</h2>';
    div.innerHTML += '<p>' + 'Penulis: ' + inputObject.author + '</p>';
    div.innerHTML += '<p>' + 'Tahun: ' + inputObject.year + '</p>';

    const actionDiv = document.createElement('div');
    actionDiv.classList.add('action');

    const greenButton = document.createElement('button');
    greenButton.textContent = inputObject.isComplete ? 'Belum Selesai Dibaca' : 'Selesai dibaca'; 
    greenButton.className = 'green';
    actionDiv.appendChild(greenButton);

    const redButton = trashButton(inputObject.id);
    actionDiv.appendChild(redButton);

    div.appendChild(actionDiv);

    if (inputObject.isComplete) {
        greenButton.addEventListener('click', function() {
            undoFromCompleted(inputObject.id);
        });
    } else {
        greenButton.addEventListener('click', function() {
            addToComplete(inputObject.id);
        });
    }

    return div;
}

function addToComplete(inputID) {
    const inputBookTarget = findBook(inputID);

    if (inputBookTarget == null || inputBookTarget.isBookComplete === true) return;

    inputBookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(inputID) {
    for (const inputItem of inputs) {
        if (inputItem.id === inputID) {
            return inputItem;
        }
    }
    return null;
}

function removeFromCompleted(inputID) {
    const inputBookTarget = findBookIndex(inputID);

    if (inputBookTarget === -1) return;

    inputs.splice(inputBookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoFromCompleted(inputID) {
    const inputBookTarget = findBook(inputID);

    if (inputBookTarget == null) return;

    inputBookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function trashButton(inputID) {
    const trashButton = document.createElement('button');
    trashButton.textContent = 'Hapus buku';
    trashButton.className = 'red';

    trashButton.addEventListener('click', function() {
        removeFromCompleted(inputID);
    });

    return trashButton;
}

function findBookIndex(inputID) {
    for (const [index, inputItem] of inputs.entries()) {
        if (inputItem.id === inputID) {
            return index;
        }
    }
    return -1;
}