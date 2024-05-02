/*
Online Python Tutor
Copyright (C) 2010-2011 Philip J. Guo (philip@pgbovine.net)
https://github.com/pgbovine/OnlinePythonTutor/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// UI for online problem sets
// Pre-req: edu-python.js and jquery.ba-bbq.min.js should be imported BEFORE this file

// parsed form of a questions file from questions/
var curQuestion = null;

// matching arrays of test code and 'expected outputs' from those tests
var tests = null;
var expects = null;
var curTestIndex = -1;

// the results returned by executing the respective 'tests' and 'expects'
// Python code.  See resetTestResults for invariants.
var testResults = null;

// Pre: 'tests' and 'expects' are non-null
function resetTestResults() {
  testResults = [];
  tests.forEach(function () {
    testResults.push(null);
  });

  assert(testResults.length > 0);
  assert(testResults.length == tests.length);
}

$(document).ready(function () {
  eduPythonCommonInit(); // must call this first!

  var pyInputPane = document.getElementById("pyInputPane");
  var pyOutputPane = document.getElementById("pyOutputPane");
  var executeBtn = document.getElementById("executeBtn");

  var pyGradingPane = document.getElementById("pyGradingPane");
  var HintStatement = document.getElementById("HintStatement");
  var SolutionStatement = document.getElementById("SolutionStatement");
  var submitBtn = document.getElementById("submitBtn");

  addTabSupport(document.getElementById("actualCodeInput"));
  addTabSupport(document.getElementById("testCodeInput"));

  // be friendly to the browser's forward and back buttons
  window.addEventListener("hashchange", function () {
    appMode = location.hash.substring(1);

    // if there's no curTrace or the hash has not been set, default mode is 'edit'
    if (!appMode || !curTrace) {
      appMode = "edit";
      location.hash = "#edit";
    }

    if (appMode == "edit") {
      pyInputPane.style.display = "block";
      pyOutputPane.style.display = "none";
      pyGradingPane.style.display = "none";

      HintStatement.style.display = "block";
      SolutionStatement.style.display = "block";
    } else if (appMode == "visualize") {
      pyInputPane.style.display = "none";
      pyOutputPane.style.display = "block";
      pyGradingPane.style.display = "none";

      HintStatement.style.display = "block";
      SolutionStatement.style.display = "block";

      submitBtn.textContent = "Submit answer";
      submitBtn.disabled = false;

      executeBtn.textContent = "Visualize execution";
      executeBtn.disabled = false;

      // do this AFTER making #pyOutputPane visible, or else
      // jsPlumb connectors won't render properly
      processTrace(curTrace);

      // don't let the user submit answer when there's an error
      for (var i = 0; i < curTrace.length; i++) {
        var curEntry = curTrace[i];
        if (curEntry.event == "exception" || curEntry.event == "uncaught_exception") {
          submitBtn.disabled = true;
          break;
        }
      }
    } else if (appMode == "grade") {
      document.querySelector("#gradeMatrix #gradeMatrixTbody").innerHTML = ""; // clear it!!!

      pyInputPane.style.display = "none";
      pyOutputPane.style.display = "none";
      pyGradingPane.style.display = "block";

      HintStatement.style.display = "none";
      SolutionStatement.style.display = "none";

      gradeSubmission();
    }
  });

  // Since the event is only triggered when the hash changes, we need
  // to trigger the event now, to handle the hash the page may have
  // loaded with.
  window.dispatchEvent(new Event("hashchange"));

  // load the questions file specified by the query string
  fetch("../main.py", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request: "question", question_file: location.search.substring(1) }),
  })
    .then((response) => response.json())
    .then((data) => finishQuestionsInit(data))
    .catch((error) => console.error("Error:", error));
});

// concatenate solution code and test code:
function concatSolnTestCode(solnCode, testCode) {
  return solnCode.replace(/\s+$/, "") + "\n\n# Everything below here is test code\n" + testCode;
}

function genDebugLinkHandler(failingTestIndex) {
  return function () {
    // Switch back to visualize mode, populating the "testCodeInput"
    // field with the failing test case, and RE-RUN the back-end to
    // visualize execution (this time with proper object IDs)
    curTestIndex = failingTestIndex;
    document.getElementById("testCodeInput").value = tests[curTestIndex];

    // prevent multiple-clicking ...
    this.innerHTML = "One sec ...";
    this.disabled = true;

    document.getElementById("executeBtn").click(); // emulate an execute button press!
  };
}

function finishQuestionsInit(questionsDat) {
  curQuestion = questionsDat; // initialize global

  document.getElementById("ProblemName").value = questionsDat.name;
  document.getElementById("ProblemStatement").value = questionsDat.question;

  document.getElementById("showHintHref").addEventListener("click", function () {
    document.getElementById("HintStatement").innerHTML = "<b>Hint</b>: " + questionsDat.hint;
  });

  document.getElementById("showSolutionHref").addEventListener("click", function () {
    document.getElementById("SolutionStatement").innerHTML = "<b>Solution</b>: " + questionsDat.solution;
  });

  document.getElementById("actualCodeInput").value = questionsDat.skeleton;

  // set some globals
  tests = questionsDat.tests;
  expects = questionsDat.expects;
  curTestIndex = 0;

  resetTestResults();

  document.getElementById("testCodeInput").value = tests[curTestIndex];

  var executeBtn = document.getElementById("executeBtn");
  executeBtn.disabled = false;
  executeBtn.addEventListener("click", function () {
    if (curQuestion.max_line_delta) {
      // if the question has a 'max_line_delta' field, then check to see
      // if > curQuestion.max_line_delta lines have changed from
      // curQuestion.skeleton, and reject the attempt if that's the case
      var numChangedLines = 0;

      // split on newlines to do a line-level diff
      // (rtrim both strings to discount the effect of trailing
      // whitespace and newlines)
      var diffResults = diff(
        // TODO: remove dependacy
        document.getElementById("actualCodeInput").value.replace(/\s+$/, "").split(/\n/),
        questionsDat.skeleton.replace(/\s+$/, "").split(/\n/)
      );
      //console.log(diffResults);
      diffResults,
        forEach((e) => {
          if (e.file1 && e.file2) {
            // i THINK this is the right way to calculate the number of
            // changed lines ... taking the MAXIMUM of the delta lengths
            // of e.file1 and e.file2:
            numChangedLines += Math.max(e.file1.length, e.file2.length);
          }
        });

      if (numChangedLines > curQuestion.max_line_delta) {
        alert(
          "Error: You have changed " +
            numChangedLines +
            " lines of code, but you are only allowed to change " +
            curQuestion.max_line_delta +
            " lines to solve this problem."
        );
        return;
      }
    }

    this.textContent = "Please wait ... processing your code";
    this.disabled = true;
    document.getElementById("pyOutputPane").style.display = "none";

    var submittedCode = concatSolnTestCode(
      document.getElementById("actualCodeInput").value,
      document.getElementById("testCodeInput").value
    );

    var postParams = { request: "execute", user_script: submittedCode };
    if (questionsDat.max_instructions) {
      postParams.max_instructions = questionsDat.max_instructions;
    }

    fetch("../main.py", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postParams),
    })
      .then((response) => response.json())
      .then((data) => {
        renderPyCodeOutput(submittedCode);
        curTrace = data;
        location.hash = "#visualize";
      })
      .catch((error) => console.error("Error:", error));
  });

  document.getElementById("editBtn").addEventListener("click", function () {
    location.hash = "#edit";
  });

  var submitBtn = document.getElementById("submitBtn");
  submitBtn.addEventListener("click", function () {
    this.textContent = "Please wait ... submitting ...";
    this.disabled = true;

    resetTestResults(); // prepare for a new fresh set of test results

    // remember that these results come in asynchronously and probably
    // out-of-order, so code very carefully here!!!
    for (var i = 0; i < tests.length; i++) {
      const ind = i;
      var submittedCode = concatSolnTestCode(document.getElementById("actualCodeInput").value, tests[i]);

      var postParams = {
        request: "run test",
        user_script: submittedCode,
        expect_script: expects[i],
      };
      if (questionsDat.max_instructions) {
        postParams.max_instructions = questionsDat.max_instructions;
      }

      fetch("../main.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postParams),
      })
        .then((response) => response.json())
        .then((data) => {
          assert(testResults[ind] === null);
          testResults[ind] = data;

          let sum = 0;
          testResults.forEach((result) => {
            if (result != null) {
              sum += 1;
            }
          });
          if (sum == testResults.length) {
            location.hash = "#grade";
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  });
}

// should be called after ALL elements in testsTraces and expectsTraces
// have been populated by their respective AJAX POST calls
function gradeSubmission() {
  document.getElementById("submittedCodePRE").innerHTML = htmlspecialchars(
    document.getElementById("actualCodeInput").value
  );

  const gradeMatrix = document.querySelector("#gradeMatrix tbody#gradeMatrixTbody");
  const happyFaceImg = '<img style="vertical-align: middle;" src="yellow-happy-face.png"/>';
  const sadFaceImg = '<img style="vertical-align: middle; margin-right: 8px;" src="red-sad-face.jpg"/>';

  testResults.forEach((result, i) => {
    const gradeMatrixRow = document.createElement("tr");
    gradeMatrixRow.className = "gradeMatrixRow";
    gradeMatrix.appendChild(gradeMatrixRow);

    const testInputCell = document.createElement("td");
    testInputCell.className = "testInputCell";
    gradeMatrixRow.appendChild(testInputCell);

    // input_val could be null if there's a REALLY bad error :(
    if (result.input_globals) {
      const testInputSubTable = document.createElement("table");
      testInputCell.appendChild(testInputSubTable);

      // print out all non-function input global variables in a table
      Object.entries(result.input_globals).forEach((entry) => {
        const [k, v] = entry;
        if (v == null || typeof v != "object" || v[0] != "function") {
          const testInputVarRow = document.createElement("tr");
          testInputSubTable.appendChild(testInputVarRow);

          const testInputVarnameCell = document.createElement("td");
          testInputVarnameCell.className = "testInputVarnameCell";
          testInputVarnameCell.textContent = k + ":";
          testInputVarRow.appendChild(testInputVarnameCell);

          const testInputValCell = document.createElement("td");
          testInputValCell.className = "testInputValCell";
          testInputVarRow.appendChild(testInputValCell);

          renderData(v, testInputValCell, true /* ignoreIDs */);
        }
      });
    }

    if (result.status == "error") {
      const testOutputCell = document.createElement("td");
      testOutputCell.className = "testOutputCell";
      gradeMatrixRow.appendChild(testOutputCell);

      const span1 = document.createElement("span");
      span1.style.color = "darkRed";
      span1.textContent = result.error_msg;
      testOutputCell.appendChild(span1);
    } else {
      assert(result.status == "ok");
      const testOutputCell = document.createElement("td");
      testOutputCell.className = "testOutputCell";
      gradeMatrixRow.appendChild(testOutputCell);

      const testOutputSubTable = document.createElement("table");
      testOutputCell.appendChild(testOutputSubTable);

      const testOutputVarRow = document.createElement("tr");
      testOutputSubTable.appendChild(testOutputVarRow);

      const testOutputVarnameCell = document.createElement("td");
      testOutputVarnameCell.className = "testOutputVarnameCell";
      testOutputVarnameCell.textContent = result.output_var_to_compare + ":";
      testOutputVarRow.appendChild(testOutputVarnameCell);

      const testOutputValCell = document.createElement("td");
      testOutputValCell.className = "testOutputValCell";
      testOutputVarRow.appendChild(testOutputValCell);

      renderData(v, testOutputValCell, true /* ignoreIDs */);
    }

    const statusCell = document.createElement("td");
    statusCell.className = "statusCell";
    gradeMatrixRow.appendChild(statusCell);

    const expectedCell = document.createElement("td");
    expectedCell.className = "expectedCell";
    gradeMatrixRow.appendChild(expectedCell);

    if (result.passed_test) {
      statusCell.innerHTML = happyFaceImg;
    } else {
      const debugMeBtn = document.createElement("button");
      debugMeBtn.type = "button";
      debugMeBtn.textContent = "Debug me";

      statusCell.innerHTML = sadFaceImg + debugMeBtn;
      expectedCell.textContent = "Expected: ";

      renderData(result.expect_val, expectedCell, true /* ignoreIDs */);

      debugMeBtn.onclick = genDebugLinkHandler(i);
    }
  });

  var numPassed = 0;
  testResults.forEach((result) => {
    if (result.passed_test) {
      numPassed++;
    }
  });

  const gradeSummary = document.getElementById("gradeSummary");
  if (numPassed < tests.length) {
    gradeSummary.innerHTML =
      "Your submitted answer passed " +
      numPassed +
      " out of " +
      tests.length +
      " tests.  Try to debug the failed tests!";
  } else {
    assert(numPassed == tests.length);
    gradeSummary.innerHTML = "Congrats, your submitted answer passed all " + tests.length + " tests!";
  }
}
