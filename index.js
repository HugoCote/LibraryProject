const libraryNode = document.querySelector(".library")
const libraryRows = libraryNode.querySelector(".lib-rows")
const saveButton = document.querySelector("header .button-save")
const libraryRecordId = "DEMO-LIBRARY-DW23D-GJ73D"

let myLibrary = [];

class Book {
    title
    author
    read

    constructor(title, author, read = false) {
        this.title = title;
        this.author = author;
        this.read = read;
    }

    static NewEmpty() { return new Book("", ""); }

    static isValidString(str) {
        console.log("validating str <" + str + ">")
        return typeof(str) === 'string' && /^[a-zA-Z ]+$/.test(str) && !/^\s*$/.test(str)
    }

    formatField(fieldname) {
        if (['title', 'author'].includes(fieldname)) return this[fieldname];
        if (fieldname === 'read') return this.read ? 'Read' : 'Not read';
        return '???'
    }

    toggleRead() {
        this.read = !this.read;
    }

    validate() {
        let isValid = {
            "title": Book.isValidString(this.title),
            "author": Book.isValidString(this.author),
        }
        console.log({ isValid })
        return isValid
    }

    isValid() {
        let validate = this.validate()
        let invalids = Object.keys(validate).filter(k => validate[k] === false)
        console.log({ invalids })
        if (invalids.length === 0) return true
        return invalids
    }

    toJson() {
        return JSON.stringify(this);
    }

    static fromObject(object) {
        return new Book(object.title, object.author, object.read);
    }
    static fromJson(json) {
        return Book.fromObject(JSON.parse(json));
    }
}

let bookBuilder = (() => {
    let book;

    resetBook = () => { book = Book.NewEmpty() }
    getBook = () => { return book; }

    resetBook()
    return { getBook, resetBook }
})()

function buildReadButtonFor(bookRow, newBook) {
    let readVal = document.createElement("td");
    let toggleReadButton = document.createElement("input");
    let labelReadButton = document.createElement("label");
    toggleReadButton.type = "checkbox";
    toggleReadButton.linkTo = (newBook) => {
        toggleReadButton.checked = newBook.read
        labelReadButton.textContent = newBook.formatField('read');
        toggleReadButton.onclick = () => {
            newBook.toggleRead()
            labelReadButton.textContent = newBook.formatField('read');
        }
    }
    toggleReadButton.linkTo(newBook)
    readVal.classList = "read-button"
    readVal.appendChild(toggleReadButton);
    readVal.appendChild(labelReadButton);
    bookRow.appendChild(readVal);
    return toggleReadButton;
}

function addBuildertoDom(bookBuidler) {
    let bookBuilderRow = document.createElement("tr")
    bookBuilderRow.classList = "lib-row builder"
    inputFields = {}
    for (const elem of['title', 'author']) {
        let columnVal = document.createElement("td");
        let inputForm = document.createElement("input");
        inputForm.setAttribute("type", "text")
        inputForm.required = "true"
        inputForm.placeholder = "   ...   "
        inputForm.value = bookBuidler.getBook().formatField(elem);
        columnVal.appendChild(inputForm);
        bookBuilderRow.appendChild(columnVal);
        inputFields[elem] = inputForm
    }
    // read button
    let toggleReadButton = buildReadButtonFor(bookBuilderRow, bookBuilder.getBook())

    function shakeBadInput(div) {
        // very convincing fading shaking movement,
        let duration = 200;
        div.animate([
            { background: "red", transform: "translateX(-7px)" },
            { background: "red", transform: "translateX(7px)" },
            { background: "red", transform: "translateX(-5px)" },
            { background: "red", transform: "translateX(5px)" },
            { background: "red", transform: "translateX(-3px)" },
            { background: "red", transform: "translateX(3px)" },
        ], {
            composite: "replace",
            duration,
        });
    }
    // build button
    let columnVal = document.createElement("td");
    let buildButton = document.createElement("button");
    columnVal.classList = "action-wrap";
    buildButton.classList = "build-book";
    buildButton.onclick = () => {
        let newBook = bookBuidler.getBook();
        newBook.title = inputFields['title'].value
        newBook.author = inputFields['author'].value
        if (newBook.isValid() !== true) { // refure input, dont build new book
            shakeBadInput(buildButton)
                // return;
        }
        Object.keys(inputFields).forEach(fieldname => {
            inputFields[fieldname].value = ""
        })
        addBooktoDom(newBook)
        bookBuidler.resetBook()
        toggleReadButton.linkTo(bookBuidler.getBook())
    };
    // buildButton.setAttribute("disabled", "true");
    buildButton.textContent = "+";
    columnVal.appendChild(buildButton);
    bookBuilderRow.appendChild(columnVal);
    libraryRows.appendChild(bookBuilderRow);
}

function addBooktoDom(newBook) {
    // add book to the DOM
    let bookRow = document.createElement("tr");
    bookRow.classList = "lib-row";
    // column book key:value 
    for (const elem of['title', 'author']) {
        let columnVal = document.createElement("td");
        // columnVal.classList = `field-${elem}`
        columnVal.textContent = newBook.formatField(elem)
            // columnVal.style.color = "var(--banner-color)"
        bookRow.appendChild(columnVal);
    }
    // read button
    buildReadButtonFor(bookRow, newBook)

    // delete book button
    let columnVal = document.createElement("td");
    let closeButton = document.createElement("button");
    closeButton.onclick = () => {
        myLibrary = myLibrary.filter(book => book !== newBook)
        libraryRows.removeChild(bookRow)
    }
    columnVal.classList = "action-wrap"
    closeButton.classList = "delete-book"
    closeButton.textContent = "x";
    columnVal.appendChild(closeButton);
    bookRow.appendChild(columnVal);
    libraryRows.appendChild(bookRow);
    myLibrary.push(newBook);
}

addBuildertoDom(bookBuilder)

saveButton.onclick = () => {
    window.localStorage.setItem(libraryRecordId, JSON.stringify(myLibrary))
}

let permanentLibrary = window.localStorage.getItem(libraryRecordId);
let parsedLibrary = permanentLibrary && JSON.parse(permanentLibrary);
if (parsedLibrary != null && parsedLibrary.length > 0) {
    // library already exists with at least one book inside
    JSON.parse(permanentLibrary).forEach(object => {
        addBooktoDom(Book.fromObject(object))
    })
} else {
    // add demo books
    let book1 = Book.NewEmpty()
    book1.title = "Star Wars"
    book1.author = "FuckOff"
    book1.read = true
    addBooktoDom(book1)

    let book2 = Book.NewEmpty()
    book2.title = "LOTR"
    book2.author = "Bart"
    book2.read = false
    addBooktoDom(book2)

    let book3 = Book.NewEmpty()
    book3.title = "Les histoires incroyables des orphelins baudelaires"
    book3.author = "Bartelemy DeLacroix Saint-George"
    book3.read = false
    addBooktoDom(book3)
}