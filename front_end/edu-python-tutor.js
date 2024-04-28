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

  var pyInput = document.getElementById("pyInput");
  var pyInputPane = document.getElementById("pyInputPane");
  var pyOutputPane = document.getElementById("pyOutputPane");
  var executeBtn = document.getElementById("executeBtn");

  fetch("../example_code/")
    .then((response) => response.json())
    .then((data) => {
      // Populate the select dropdown with filenames
      const select = document.getElementById("exampleSelect");
      data.forEach((filename) => {
        const option = document.createElement("option");
        option.textContent = filename.split(".")[0];
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching filenames:", error));

  pyInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
    } else if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      var tabLength = "\t".length;
      var selectedText = this.value.substring(start, end);
      var lines = selectedText.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("\t")) {
          lines[i] = lines[i].substring(tabLength);
        }
      }
      this.value = this.value.substring(0, start) + lines.join("\n") + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start - tabLength;
    }
  });

  // be friendly to the browser's forward and back buttons
  window.addEventListener("hashchange", function () {
    var appMode = location.hash.substr(1); // assign this to the GLOBAL appMode

    // default mode is 'edit'
    if (!appMode) {
      appMode = "edit";
    }

    // if there's no curTrace, then default to edit mode since there's nothing to visualize:
    if (!curTrace) {
      appMode = "edit";
      history.pushState({ mode: "edit" }, "");
    }

    if (appMode === "edit") {
      pyInputPane.style.display = "block";
      pyOutputPane.style.display = "none";
    } else if (appMode === "visualize") {
      pyInputPane.style.display = "none";
      pyOutputPane.style.display = "block";

      executeBtn.innerText = "Visualize execution";
      executeBtn.disabled = false;

      // do this AFTER making #pyOutputPane visible, or else
      // jsPlumb connectors won't render properly
      processTrace(curTrace);
    } else {
      console.assert(false);
    }
  });

  // Since the event is only triggered when the hash changes, we need
  // to trigger the event now, to handle the hash the page may have
  // loaded with.
  window.dispatchEvent(new Event("hashchange"));

  executeBtn.disabled = false;
  executeBtn.addEventListener("click", function () {
    var pyInputValue = pyInput.value;
    this.innerText = "Please wait ... processing your code";
    this.disabled = true;
    pyOutputPane.style.display = "none";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "../main.py", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        curTrace = JSON.parse(xhr.responseText);
        renderPyCodeOutput(pyInputValue);
        history.pushState({ mode: "visualize" }, "");
      }
    };
    xhr.send(JSON.stringify({ user_script: pyInputValue, request: "execute" }));
  });

  document.getElementById("editBtn").addEventListener("click", function () {
    history.pushState({ mode: "edit" }, "");
  });
});
