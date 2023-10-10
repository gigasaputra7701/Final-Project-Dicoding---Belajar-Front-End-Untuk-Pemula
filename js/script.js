const STORAGE_KEY = "BOOK_LIST";

let bookTemp = [];

 function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser kamu tidak mendukung local storage");
        return false
    } 
    return true;
}

function saveData() {
    const parsed  = JSON.stringify(bookTemp);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    let data = JSON.parse(serializedData);
    
    if(data !== null)
        bookTemp = data;

    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if(isStorageExist())
        saveData();
}

function composeTodoObject(title, author, year, isCompleted) {
   return {
       id: +new Date(),
       title,
       author,
       year,
       isCompleted
   };
}

function findTodo(todoId) {

    for(todo of bookTemp){
        if(todo.id === todoId){
            return todo;
        }
    }

    return null;
}

function findTodoIndex(todoId) {
    
    let index = 0
    for (todo of bookTemp) {
        if(todo.id === todoId){
            return index;
        }
        index++;
    }

    return -1;
}


document.addEventListener("DOMContentLoaded", function () {
 
    const submitBook = document.getElementById("inputBook");
    const searchBook = document.getElementById("searchBook");

    submitBook.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
        alert("Buku ditambahkan");
    });

    searchBook.addEventListener("submit", function (event) {
        event.preventDefault();
        const inputText = searchBook.querySelector("input").value;
        searchBooks(inputText);
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener("ondatasaved", () => {
    console.log("Data berhasil di simpan.");
});

document.addEventListener("ondataloaded", () => {
    console.log("Data direfresh.");
    refreshDataFromTodos();
});

const UNFINISH_READ = "incompleteBookshelfList";
const FINISH_READ = "completeBookshelfList";
const TODO_ITEMID = "itemId";

function addBook(){
    const uncompleteRead = document.getElementById(UNFINISH_READ);
    const completeRead = document.getElementById(FINISH_READ);

    const textTitle = document.getElementById("inputBookTitle").value;
    const textAuthor = document.getElementById("inputBookAuthor").value;
    const textYear = document.getElementById("inputBookYear").value;
    const cekFinish = document.getElementById("inputBookIsComplete").checked;

    console.log(cekFinish);
    console.log(textTitle);
    console.log(textAuthor);
    console.log(textYear);
    if (cekFinish){
        const makeList = makeBook(textTitle, textAuthor, textYear, true);
        const todoObject = composeTodoObject(textTitle, textAuthor, textYear, true);
        makeList[TODO_ITEMID] = todoObject.id;
        bookTemp.push(todoObject);
        completeRead.append(makeList);
        updateDataToStorage();
    } else {
        const makeList = makeBook(textTitle, textAuthor, textYear, false);
        const todoObject = composeTodoObject(textTitle, textAuthor, textYear, false);
        makeList[TODO_ITEMID] = todoObject.id;
        bookTemp.push(todoObject);
        uncompleteRead.append(makeList);
        updateDataToStorage();
    }
}


function makeBook(name, author, year, isCompleted){
    const textTitle =  document.createElement("h3");
    textTitle.innerText = name;

    const textAuthor = document.createElement("p");
    textAuthor.classList.add("author");
    textAuthor.innerText = author;

    const textYear = document.createElement("p");
    textYear.classList.add("year");
    textYear.innerText = year;
    console.log(textTitle);
    console.log(textAuthor);
    console.log(textYear);

    const btnAction = document.createElement("div");
    btnAction.classList.add("action");
    
    if (isCompleted){
        btnAction.append(UndoBook(), DeleteBook());
    } else {
        btnAction.append(finishReadBook(), DeleteBook());
    }

    const textContainer = document.createElement("article");
    textContainer.classList.add("book_item");
    textContainer.append(textTitle, textAuthor, textYear, btnAction);
    
    return textContainer;
}

function createButton(buttonTypeClass , buttonText, eventListener) {
    const button = document.createElement("button");
    button.classList.add(buttonTypeClass);


    const textA = document.createTextNode(buttonText);
    button.appendChild(textA);

    button.addEventListener("click", function (event) {
        eventListener(event);
    });
    return button;
}

function addTaskToCompleted(taskElement) {
    const listCompleted = document.getElementById(FINISH_READ);
    const taskTitle = taskElement.querySelector("h3").innerText;
    const taskAuthor = taskElement.querySelector(".author").innerText;
    const taskYear = taskElement.querySelector(".year").innerText;

    console.log(taskTitle);
    console.log(taskAuthor);
    console.log(taskYear);

    const newBook = makeBook(taskTitle, taskAuthor, taskYear, true);
    const todo = findTodo(taskElement[TODO_ITEMID]);
    todo.isCompleted = true;
    newBook[TODO_ITEMID] = todo.id;

    listCompleted.append(newBook);
    taskElement.remove();

    updateDataToStorage();
}

function removeTaskFromCompleted(taskElement) {
    const todoPosition = findTodoIndex(taskElement[TODO_ITEMID]);
    bookTemp.splice(todoPosition, 1);

    taskElement.remove();
    updateDataToStorage();
}
function DeleteBook() {
    return createButton("red", "Hapus Buku", function(event){
        const conf = confirm("Apakah Anda ingin menghapus buku?")
        if (conf == true){
            alert("Buku berhasil dihapus");
            const delBook = event.target.parentElement;
        removeTaskFromCompleted(delBook.parentElement);
        } else {
            return -1;
        }
        
    });
}

function finishReadBook() {
    return createButton("green", "Selesai di Baca", function(event){
        const conf = confirm("Apakah anda Sudah membaca buku tersebut?")
        if (conf == true){
            alert("Buku berhasil dipindahkan ke rak sudah dibaca");
            const delBook = event.target.parentElement;
            addTaskToCompleted(delBook.parentElement);
        } else {
            return -1;
        }
        
    });
    
}

function UndoBook() {
    return createButton("green", "Belum Selesai di Baca", function(event){
        const conf = confirm("Apakah Anda belum selesai membaca buku tersebut?")
        if (conf == true){
            alert("Buku berhasil dipindahkan ke rak belum selesai dibaca");
            const uBook = event.target.parentElement;
        undoTaskFromCompleted(uBook.parentElement);
        } else {
            return -1;
        }
        
    });
}

function undoTaskFromCompleted(taskElement){
    
    const listUncompleted = document.getElementById(UNFINISH_READ);
    const taskTitle = taskElement.querySelector("h3").innerText;
    const taskAuthor = taskElement.querySelector(".author").innerText;
    const taskYear = taskElement.querySelector(".year").innerText;
 
    console.log(taskTitle);
    console.log(taskAuthor);
    console.log(taskYear);
    const newBook = makeBook(taskTitle, taskAuthor, taskYear, false);

    
    const todo = findTodo(taskElement[TODO_ITEMID]);
    todo.isCompleted = false;
    newBook[TODO_ITEMID] = todo.id;

    listUncompleted.append(newBook);
    taskElement.remove();

    updateDataToStorage();
}


function refreshDataFromTodos() {
    const listUncompleted = document.getElementById(UNFINISH_READ);
    let listCompleted = document.getElementById(FINISH_READ);

    for(todo of bookTemp){
        const newTodo = makeBook(todo.title, todo.author, todo.year, todo.isCompleted);
        newTodo[TODO_ITEMID] = todo.id;

        if(todo.isCompleted){
            listCompleted.append(newTodo);
        } else {
            listUncompleted.append(newTodo);
        }
    }
}

function searchBooks(inputText){

    const updateBook = bookTemp.filter(book=>book["title"].toLowerCase().includes(inputText.toLowerCase()));

    const listUncompleted = document.getElementById(UNFINISH_READ);
    let listCompleted = document.getElementById(FINISH_READ);
    listUncompleted.innerHTML = "";
    listCompleted.innerHTML = "";

    for(todo of updateBook){
        const newTodo = makeBook(todo.title, todo.author, todo.year, todo.isCompleted);
        newTodo[TODO_ITEMID] = todo.id;

        if(todo.isCompleted){
            listCompleted.append(newTodo);
        } else {
            listUncompleted.append(newTodo);
        }
    }
}

