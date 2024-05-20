const BASE_API_URL = "https://rithm-jeopardy.herokuapp.com/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;
let categories = [];

/** Fetches random category IDs from the API. */
async function getCategoryIds() {
  try {
    const response = await axios.get(`${BASE_API_URL}categories`, {
      params: { count: 100 }
    });
    const catIds = _.sampleSize(response.data.map(category => category.id), NUM_CATEGORIES);
    return catIds;
  } catch (error) {
    console.error('Error fetching category IDs:', error);
    return [];
  }
}

/** Fetches category data for a given category ID. */
async function getCategory(catId) {
  try {
    const response = await axios.get(`${BASE_API_URL}category`, {
      params: { id: catId }
    });
    const cat = response.data;
    const randomClues = _.sampleSize(cat.clues, NUM_CLUES_PER_CAT).map(c => ({
      question: c.question,
      answer: c.answer,
      showing: null
    }));
    return { title: cat.title, clues: randomClues };
  } catch (error) {
    console.error(`Error fetching category ${catId}:`, error);
    return null;
  }
}

/** Fills the HTML table with categories and clue placeholders. */
async function fillTable() {
  hideLoadingView();

  const $thead = $('#jeopardy thead');
  const $tbody = $('#jeopardy tbody');
  $thead.empty();
  $tbody.empty();

  // Add headers for categories
  for (const category of categories) {
    $thead.append($("<th>").text(category.title));
  }

  // Add clue placeholders to the table
  for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_CAT; clueIdx++) {
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
      $tr.append(
        $("<td>")
          .attr("id", `${catIdx}-${clueIdx}`)
          .append($("<i>").addClass("fas fa-question-circle fa-3x"))
      );
    }
    $tbody.append($tr);
  }
}

/** Handles clicking on a clue: toggles between showing question and answer. */
function handleClick(evt) {
  const $target = $(evt.target);
  const id = $target.attr("id");
  const [catId, clueId] = id.split("-");
  const clue = categories[catId].clues[clueId];

  if (!clue.showing) {
    // Show question
    $target.html(clue.question);
    clue.showing = "question";
  } else if (clue.showing === "question") {
    // Show answer
    $target.html(clue.answer);
    clue.showing = "answer";
    $target.addClass("disabled");
  }
}

/** Shows the loading spinner and clears the table. */
function showLoadingView() {
  $("#jeopardy thead").empty();
  $("#jeopardy tbody").empty();
  $("#spin-container").show();
  $("#start").addClass("disabled").text("Loading...");
}

/** Hides the loading spinner. */
function hideLoadingView() {
  $("#start").removeClass("disabled").text("Restart!");
  $("#spin-container").hide();
}

/** Starts the game by fetching categories and filling the table. */
async function setupAndStart() {
  const isLoading = $("#start").text() === "Loading...";
  if (!isLoading) {
    showLoadingView();

    const catIds = await getCategoryIds();
    categories = [];

    for (const catId of catIds) {
      categories.push(await getCategory(catId));
    }

    fillTable();
  }
}

/** Sets up the game when the page loads. */
$(document).ready(async function() {
  $("#start").on("click", setupAndStart);
  $("#jeopardy").on("click", "td", handleClick);
});



  
  
  


