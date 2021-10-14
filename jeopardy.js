const DOMbody = document.querySelector("body");


// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];



/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let catIDs = []
  
    // API call to get random categories
    const res = await axios.get("http://jservice.io/api/random", { params: { count: 50 }})

    // Push IDs to catIDs
    res.data.forEach(el => catIDs.push(el.category.id))

    // Remove duplicates if any
    catIDs = _.uniq(catIDs)

    // Pick 6 random IDs
    catIDs = _.sampleSize(catIDs, 6)

    // Return data
    return catIDs
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const data = {
        title: "",
        clues: [],
    }
   
    // API call to get category info
    const res = await axios.get("http://jservice.io/api/category", { params: { id: catId }})

    // Create data object
    data.title = res.data.title
    // Loop over array to create clues array
    res.data.clues.forEach(el => data.clues.push({
        question: el.question,
        answer: el.answer,
        showing: null
    }))

    // Return data
    return data
}

// Add table HTML to the DOM
function addTableHTML(HTML){
    document.querySelector(".game-board").innerHTML = HTML
}

/** Fill the HTML table #jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(categories) {
    const tableHTML = 
    `
    <table class="game-table">
            <thead>
                  <tr>
                        <th class="cell header-row">${categories[0].title}</th>
                        <th class="cell header-row">${categories[1].title}</th>
                        <th class="cell header-row">${categories[2].title}</th>
                        <th class="cell header-row">${categories[3].title}</th>
                        <th class="cell header-row">${categories[4].title}</th>
                        <th class="cell header-row">${categories[5].title}</th>
                  </tr>
            </thead>
            <tbody>
                  <tr>
                        <th class="cell" data-row=1 data-col=1>?</th>
                        <th class="cell" data-row=1 data-col=2>?</th>
                        <th class="cell" data-row=1 data-col=3>?</th>
                        <th class="cell" data-row=1 data-col=4>?</th>
                        <th class="cell" data-row=1 data-col=5>?</th>
                        <th class="cell" data-row=1 data-col=6>?</th>
                  </tr>
                  <tr>
                        <th class="cell" data-row=2 data-col=1>?</th>
                        <th class="cell" data-row=2 data-col=2>?</th>
                        <th class="cell" data-row=2 data-col=3>?</th>
                        <th class="cell" data-row=2 data-col=4>?</th>
                        <th class="cell" data-row=2 data-col=5>?</th>
                        <th class="cell" data-row=2 data-col=6>?</th>
                  </tr>
                  <tr>
                        <th class="cell" data-row=3 data-col=1>?</th>
                        <th class="cell" data-row=3 data-col=2>?</th>
                        <th class="cell" data-row=3 data-col=3>?</th>
                        <th class="cell" data-row=3 data-col=4>?</th>
                        <th class="cell" data-row=3 data-col=5>?</th>
                        <th class="cell" data-row=3 data-col=6>?</th>
                  </tr>
                  <tr>
                        <th class="cell" data-row=4 data-col=1>?</th>
                        <th class="cell" data-row=4 data-col=2>?</th>
                        <th class="cell" data-row=4 data-col=3>?</th>
                        <th class="cell" data-row=4 data-col=4>?</th>
                        <th class="cell" data-row=4 data-col=5>?</th>
                        <th class="cell" data-row=4 data-col=6>?</th>  
                  </tr>
                  <tr>
                        <th class="cell" data-row=5 data-col=1>?</th>
                        <th class="cell" data-row=5 data-col=2>?</th>
                        <th class="cell" data-row=5 data-col=3>?</th>
                        <th class="cell" data-row=5 data-col=4>?</th>
                        <th class="cell" data-row=5 data-col=5>?</th>
                        <th class="cell" data-row=5 data-col=6>?</th>
                  </tr>
            </tbody>
      </table>
    `
    // Add table to the DOM
    addTableHTML(tableHTML)
    // Add event listner
    document.querySelector(".game-table").addEventListener("click", handleClick)
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    // Check if header row was clicked
    if(evt.target.className === "header-row") return

    // Get row and col index pointers
    const row = evt.target.dataset.row - 1;
    const col = evt.target.dataset.col - 1;

    // Show question
    if(categories[col].clues[row].showing === null){
        // Update text
        evt.target.textContent = categories[col].clues[row].question
        // Update showing propery & class
        categories[col].clues[row].showing = "question"
        evt.target.classList.add("question")
    } 

    // Show answer
    else if(categories[col].clues[row].showing === "question"){
        // Update text
        evt.target.textContent = categories[col].clues[row].answer
        // Update showing propery
        categories[col].clues[row].showing = "answer"
        evt.target.classList.remove("question")
        evt.target.classList.add("answer")
    }
}

// Update text displayed in the main button
function updateBtnText(text, disable){
    const button = document.querySelector("#main-btn")
    // Update button text
    button.textContent = text

    // Enable / disable button
    button.disabled = disable
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    // Add loading spinner to DOM
    const img = document.createElement("img")
    img.src = "loading.gif"
    img.classList.add("loader")
    DOMbody.appendChild(img)

    // Update button text and disable
    updateBtnText("Loading...", true)
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    // Remove loading spinner from DOM
    const loader = document.querySelector(".loader")
    if(loader) loader.remove()

    // Update button text and enable
    updateBtnText("Restart", false)
    
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    // Clear data in categories
    categories = []
    // Clear table from DOM
    addTableHTML("")
    // Show loading screen
    showLoadingView()
    // Get category IDs
    const categoryIDs = await getCategoryIds();
    // Get data for each category
    for (id of categoryIDs){
        const data = await getCategory(id);
        categories.push(data);
    }
    // Hide loading screen
    hideLoadingView()
    // Fill table
    fillTable(categories)

}

// Initial DOM setup
function initialScreen() {
    // Initial HTML to be added to DOM
    const gameBoard = `<div> 
                        <h1>Jeopardy</h1>
                        <button id="main-btn">Start</button>
                    </div>
                    <div class="game-board"></div>`;
    DOMbody.innerHTML = gameBoard;

    // Add event listner to the button just added to the DOM
    document.querySelector("#main-btn").addEventListener("click", setupAndStart)                 
}
// Initialize the DOM
initialScreen()

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO