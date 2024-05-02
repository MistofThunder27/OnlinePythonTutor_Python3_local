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

// The Online Python Tutor front-end, which calls the back-end with a string
// representing the user's script POST['user_script'] and receives a complete
// execution trace, which it parses and displays to HTML.

// Pre-req: edu-python.js and jquery.ba-bbq.min.js should be imported BEFORE this file

document.addEventListener("DOMContentLoaded", function () {
  eduPythonCommonInit(); // must call this first!
  const selectExampleBox = document.getElementById("selectExample");
  fetch("../example_code/")
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((filename) => {
          const option = document.createElement("option");
          option.textContent = filename.split(".")[0];
          option.value = filename;
          selectExampleBox.appendChild(option);
        });
      }
    })
    .catch((error) => console.error("Error fetching filenames:", error));

  var pyInput = document.getElementById("pyInput");
  var pyInputPane = document.getElementById("pyInputPane");
  var pyOutputPane = document.getElementById("pyOutputPane");
  var executeBtn = document.getElementById("executeBtn");

  addTabSupport(pyInput);

  // be friendly to the browser's forward and back buttons
  window.addEventListener("hashchange", function () {
    appMode = location.hash.substring(1);

    // if there's no curTrace or the hash has not been set, default mode is 'edit'
    if (!appMode || !curTrace) {
      appMode = "edit";
      location.hash = "#edit";
    }

    if (appMode === "edit") {
      pyInputPane.style.display = "block";
      pyOutputPane.style.display = "none";
    } else if (appMode === "visualize") {
      pyInputPane.style.display = "none";
      pyOutputPane.style.display = "block";

      executeBtn.textContent = "Visualize execution";
      executeBtn.disabled = false;

      // do this AFTER making #pyOutputPane visible, or else
      // jsPlumb connectors won't render properly
      processTrace(curTrace);
    }
  });

  // Since the event is only triggered when the hash changes, we need
  // to trigger the event now, to handle the hash the page may have
  // loaded with.
  window.dispatchEvent(new Event("hashchange"));

  executeBtn.disabled = false;
  executeBtn.addEventListener("click", function () {
    var pyInputValue = pyInput.value;
    this.textContent = "Please wait ... processing your code";
    this.disabled = true;
    pyOutputPane.style.display = "none";

    fetch("../main.py", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: "execute", user_script: pyInputValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        renderPyCodeOutput(pyInputValue);
        curTrace = data;
        location.hash = "#visualize";
      })
      .catch((error) => console.error("Error:", error));
  });

  document.getElementById("editBtn").addEventListener("click", function () {
    location.hash = "#edit";
  });
});
