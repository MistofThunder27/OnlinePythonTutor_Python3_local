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

// code that is common to all Online Python Tutor pages

var appMode = "edit"; // 'edit', 'visualize', or 'grade' (only for question.html)

var inlineRendering;
var stackGrowsUp;

/* colors - see edu-python.css */
var lightLineColor = "#FFE536";
var errorColor = "#F87D76";
var callingLineColor1 = "#ADD8E6";
var callingLineColor2 = "#90EE90";
var visitedLineColor = "#3D58A2";

var lightGray = "#cccccc";
//var lightGray = "#dddddd";
var darkBlue = "#3D58A2";
var terminatingColor = "#899CD1";
var pinkish = "#F15149";
var darkRed = "#9D1E18";

// ugh globals!
var curTrace = null;
var curInstr = 0;

// true iff trace ended prematurely since maximum instruction limit has been reached
var instrLimitReached = false;

function assert(cond) {
  if (!cond) {
    alert("Error: ASSERTION FAILED");
  }
}

// taken from http://www.toao.net/32-my-htmlspecialchars-function-for-javascript and modified
function htmlspecialchars(str) {
  return str.replace(
    /[&<> ]/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        " ": "&nbsp;",
        "\n": "<br>",
        // ignore these for now ...
        //str = str.replace(/"/g, "&quot;");
        //str = str.replace(/'/g, "&#039;");
      }[match])
  );
}

function processTrace(traceData) {
  curTrace = traceData;
  curInstr = 0;
  document.getElementById("pyStdout").value = "";

  if (curTrace.length > 0) {
    var lastEntry = curTrace[curTrace.length - 1];

    // GLOBAL!
    instrLimitReached = lastEntry.event == "instruction_limit_reached";

    if (instrLimitReached) {
      curTrace.pop(); // kill last entry which only has the error message
      const errorOutput = document.getElementById("errorOutput");
      errorOutput.innerHTML = htmlspecialchars(lastEntry.exception_msg);
      errorOutput.style.display = "block";
    }
  }
  updateOutput();
}

// relies on curTrace and curInstr globals
function updateOutput() {
  if (!curTrace) {
    return;
  }

  inlineRendering = document.getElementById("classicModeCheckbox").checked;
  stackGrowsUp = document.getElementById("stackGrowthSelector").checked;
  var curEntry = curTrace[curInstr];
  var totalInstrs = curTrace.length;

  // render VCR controls:
  var vcrControls = document.getElementById("vcrControls");

  // to be user-friendly, if we're on the LAST instruction, print "Program has terminated"
  // and DON'T highlight any lines of code in the code display
  vcrControls.querySelector("#curInstr").innerHTML =
    curInstr === totalInstrs - 1
      ? instrLimitReached
        ? "Instruction limit reached"
        : "Program has terminated"
      : "About to do step " + (curInstr + 1) + " of " + (totalInstrs - 1);

  vcrControls.querySelector("#jmpFirstInstr").disabled = vcrControls.querySelector("#jmpStepBack").disabled =
    curInstr === 0;
  vcrControls.querySelector("#jmpLastInstr").disabled = vcrControls.querySelector("#jmpStepFwd").disabled =
    curInstr === totalInstrs - 1;

  // render error (if applicable):
  var errorOutput = document.getElementById("errorOutput");
  var hasError;
  if (curEntry.event === "exception" || curEntry.event === "uncaught_exception") {
    assert(curEntry.exception_msg);
    errorOutput.innerHTML = htmlspecialchars(curEntry.exception_msg);
    errorOutput.style.display = "block";
    hasError = true;
  } else {
    errorOutput.style.display = "none";
    hasError = false;
  }

  // render code output: --
  var tbl = document.querySelector("table#pyCodeOutput");

  // Reset color and font-weight of line number cells
  tbl.querySelectorAll("td.lineNo").forEach((cell) => {
    cell.style.color = "";
    cell.style.fontWeight = "";
  });
  // Reset background color of code lines
  tbl.querySelectorAll("td.cod").forEach((line) => {
    line.style.backgroundColor = "";
    line.innerHTML = line.innerHTML.replace(/<br\/?>.*$/g, "").replace(/<span.*?>(.*?)<\/span>/g, "$1");
  });

  // Set visited lines
  curEntry.visited_lines.forEach((line) => {
    var lineNoCell = tbl.querySelectorAll("td.lineNo")[line - 1];
    lineNoCell.style.color = visitedLineColor;
    lineNoCell.style.fontWeight = "bold";
  });

  // Highlight and duplicate calling function:
  var caller_info = curEntry.caller_info;
  if (caller_info) {
    var {
      code: evaluated_code,
      line_no: callinglines,
      true_positions: [[startLine, startIndex], [endLine, endIndex]],
      relative_positions: [relativeStart, relativeEnd],
    } = caller_info;

    callinglines.forEach((line) => {
      tbl.querySelectorAll("td.cod")[line - 1].style.backgroundColor =
        curEntry.encoded_frames.length % 2 == 1 ? callingLineColor1 : callingLineColor2;
    });

    var cell, content;
    if (startLine === endLine) {
      cell = tbl.querySelectorAll("td.cod")[startLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        content.substring(0, startIndex) +
        '<span style="background-color: orange;">' +
        content.substring(startIndex, endIndex) +
        "</span>" +
        content.substring(endIndex);
    } else {
      cell = tbl.querySelectorAll("td.cod")[startLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        content.substring(0, startIndex) +
        '<span style="background-color: orange;">' +
        content.substring(startIndex) +
        "</span>";

      for (var line = startLine + 1; line <= endLine - 1; line++) {
        cell = tbl.querySelectorAll("td.cod")[line - 1];
        cell.innerHTML = '<span style="background-color: orange;">' + cell.textContent + "</span>";
      }

      cell = tbl.querySelectorAll("td.cod")[endLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        '<span style="background-color: orange;">' +
        content.substring(0, endIndex) +
        "</span>" +
        content.substring(endIndex);
    }

    cell.innerHTML +=
      '<br/><span style="font-style: italic; color: green;">' +
      htmlspecialchars(evaluated_code.substring(0, relativeStart)) +
      '<span style="background-color: orange;">' +
      htmlspecialchars(evaluated_code.substring(relativeStart, relativeEnd)) +
      "</span>" +
      htmlspecialchars(evaluated_code.substring(relativeEnd)) +
      "</span>";
  }

  // Highlight curLineGroup:
  curEntry.lines.forEach((line) => {
    tbl.querySelectorAll("td.cod")[line - 1].style.backgroundColor = hasError
      ? errorColor
      : !instrLimitReached && curInstr === totalInstrs - 1
      ? terminatingColor
      : lightLineColor;
  });

  // render stdout:
  var stdoutElement = document.getElementById("pyStdout");

  // keep original horizontal scroll level:
  var oldLeft = stdoutElement.scrollLeft;
  stdoutElement.value = curEntry.stdout;
  stdoutElement.scrollLeft = oldLeft;
  // scroll to bottom, though:
  stdoutElement.scrollTop = stdoutElement.scrollHeight;

  // finally, render all the data structures!!!
  var dataViz = document.getElementById("dataViz");
  dataViz.innerHTML = ""; // Clear the content

  // organise frames based on settings
  var orderedFrames = curEntry.encoded_frames.slice();
  if (stackGrowsUp) {
    orderedFrames = orderedFrames.reverse();
  }

  if (inlineRendering) {
    orderedFrames.forEach((frame) => {
      var vizFrame = document.createElement("div");
      vizFrame.className = "vizFrame";
      vizFrame.innerHTML = `<span style="font-family: Andale mono, monospace;">${htmlspecialchars(
        frame[0]
      )}</span> variables:`;
      dataViz.appendChild(vizFrame);

      var encodedVars = Object.entries(frame[1]);
      if (encodedVars.length > 0) {
        var frameDataViz = document.createElement("table");
        frameDataViz.className = "frameDataViz";
        vizFrame.appendChild(document.createElement("br"));
        vizFrame.appendChild(frameDataViz);

        encodedVars.forEach((entry) => {
          var [varname, val] = entry;
          var tr = document.createElement("tr");
          tr.innerHTML = `<td>${
            varname === "__return__"
              ? '<span style="font-size: 10pt; font-style: italic;">return value</span>'
              : varname
          }</td><td></td>`;
          frameDataViz.appendChild(tr);
          renderData(val, tr.querySelector("td:last-child"), false);
        });

        var lastRow = frameDataViz.lastElementChild;
        lastRow.querySelector("td:first-child").style.borderBottom = "0px";
        lastRow.querySelector("td:last-child").style.borderBottom = "0px";
      } else {
        vizFrame.innerHTML += "<i>none</i>";
      }
    });
  } else {
    renderDataStructuresVersion2(curEntry, orderedFrames);
  }
}

// The "2.0" version of renderDataStructures, which renders variables in
// a stack and values in a separate heap, with data structure aliasing
// explicitly represented via line connectors (thanks to jsPlumb lib).
//
// This version was originally created in September 2011
function renderDataStructuresVersion2(curEntry, orderedFrames) {
  // before we wipe out the old state of the visualization, CLEAR all
  // the click listeners first
  document.querySelectorAll(".stackFrameHeader").forEach((header) => {
    header.removeEventListener("click", handleClick);
  });

  // VERY VERY IMPORTANT --- and reset ALL jsPlumb state to prevent
  // weird mis-behavior!!!
  jsPlumb.reset();

  // create a tabular layout for stack and heap side-by-side
  // TODO: figure out how to do this using CSS in a robust way!
  var stack_td = document.createElement("td");
  stack_td.id = "stack_td";
  stack_td.innerHTML = '<div id="stack"></div>';

  var heap_td = document.createElement("td");
  heap_td.id = "heap_td";
  heap_td.innerHTML = '<div id="heap"></div>';

  var tr = document.createElement("tr");
  tr.appendChild(stack_td);
  tr.appendChild(heap_td);

  var stackHeapTable = document.createElement("table");
  stackHeapTable.id = "stackHeapTable";
  stackHeapTable.appendChild(tr);

  var dataViz = document.getElementById("dataViz");
  dataViz.innerHTML = "";
  dataViz.appendChild(stackHeapTable);

  // Key:   CSS ID of the div element representing the variable
  // Value: CSS ID of the div element representing the value rendered in the heap
  var connectionEndpointIDs = {};

  // first render the vars
  orderedFrames.forEach((frame, i) => {
    var stackDiv = document.createElement("div");
    var divID = "stack" + i;
    stackDiv.className = "stackFrame";
    stackDiv.id = divID;
    document.getElementById("stack").appendChild(stackDiv);

    var headerDiv = document.createElement("div");
    headerDiv.id = "stack_header" + i;
    headerDiv.className = "stackFrameHeader inactiveStackFrameHeader";
    headerDiv.innerHTML = htmlspecialchars(frame[0]);
    stackDiv.appendChild(headerDiv);

    var encodedVars = Object.entries(frame[1]);
    if (encodedVars.length > 0) {
      var table = document.createElement("table");
      table.className = "stackFrameVarTable";
      table.id = divID + "_table";
      stackDiv.appendChild(table);

      encodedVars.forEach(function (entry) {
        var [varname, val] = entry;

        var tr = document.createElement("tr");
        // special treatment for displaying return value and indicating
        // that the function is about to return to its caller
        if (varname == "__return__") {
          assert(curEntry.event == "return"); // sanity check
          tr.innerHTML = '<td colspan="2" class="returnWarning">About to return to caller</td>';
          table.appendChild(tr);
          tr = document.createElement("tr");
          tr.innerHTML =
            '<td class="stackFrameVar"><span class="retval">Return value:</span></td><td class="stackFrameValue"></td>';
        } else {
          tr.innerHTML = '<td class="stackFrameVar">' + varname + '</td><td class="stackFrameValue"></td>';
        }
        table.appendChild(tr);

        // render primitives inline and compound types on the heap
        if (val == null || typeof val != "object") {
          renderData(val, tr.querySelector("td.stackFrameValue"), false);
        } else {
          // add a stub so that we can connect it with a connector later.
          // IE needs this div to be NON-EMPTY in order to properly
          // render jsPlumb endpoints, so that's why we add an "&nbsp;"!

          // make sure varname doesn't contain any weird
          // characters that are illegal for CSS ID's ...
          //
          // I know for a fact that iterator tmp variables named '_[1]'
          // are NOT legal names for CSS ID's.
          // I also threw in '{', '}', '(', ')', '<', '>' as illegal characters.
          //
          // TODO: what other characters are illegal???
          var varDivID = divID + "__" + varname.replace(/[\[{|(<>]/g, "LeftB_").replace(/[\]}|)<>]/g, "_RightB");
          var divElement = document.createElement("div");
          divElement.id = varDivID;
          divElement.innerHTML = "&nbsp;";
          tr.querySelector("td.stackFrameValue").appendChild(divElement);

          if (connectionEndpointIDs[varDivID] === undefined) {
            connectionEndpointIDs[varDivID] = "heap_object_" + getObjectID(val);
          }
        }
      });
    }
  });

  // then render the heap
  dataViz.querySelector("#heap").innerHTML += '<div id="heapHeader">Heap</div>';

  // if there are multiple aliases to the same object, we want to render
  // the one deepest in the stack, so that we can hopefully prevent
  // objects from jumping around as functions are called and returned.
  // e.g., if a list L appears as a global variable and as a local in a
  // function, we want to render L when rendering the global frame.

  var alreadyRenderedObjectIDs = new Set(); // set of object IDs that have already been rendered
  curEntry.encoded_frames.forEach((frame) => {
    Object.entries(frame[1]).forEach((entry) => {
      var val = entry[1];
      // primitive types are already rendered in the stack
      if (typeof val == "object" && val != null) {
        var objectID = getObjectID(val);

        if (!alreadyRenderedObjectIDs.has(objectID)) {
          var heapObjID = "heap_object_" + objectID;
          dataViz.querySelector("#heap").innerHTML += '<div class="heapObject" id="' + heapObjID + '"></div>';
          renderData(val, dataViz.querySelector("#heap #" + heapObjID), false);

          alreadyRenderedObjectIDs.add(objectID);
        }
      }
    });
  });

  // finally connect stack variables to heap objects via connectors
  Object.entries(connectionEndpointIDs).forEach((entry) => {
    jsPlumb.connect({ source: entry[0], target: entry[1] });
  });

  // add an on-click listener to all stack frame headers
  document.querySelectorAll(".stackFrameHeader").forEach((header) => {
    header.addEventListener("click", function () {
      var enclosingStackFrame = this.parentNode;
      var enclosingStackFrameID = enclosingStackFrame.getAttribute("id");

      var allConnections = jsPlumb.getConnections();
      allConnections.forEach((connection) => {
        var element = connection.source;
        while (element.attr("class") != "stackFrame") {
          element = element.parent();
        }

        // if this connector starts in the selected stack frame ...
        if (element.attr("id") == enclosingStackFrameID) {
          // then HIGHLIGHT IT!
          connection.setPaintStyle({ lineWidth: 2, strokeStyle: darkBlue });
          connection.endpoints[0].setPaintStyle({ fillStyle: darkBlue });
          connection.endpoints[1].setVisible(false, true, true); // JUST set right endpoint to be invisible

          // ... and move it to the VERY FRONT
          connection.canvas.style.zIndex = 1000;
        } else {
          // else unhighlight it
          connection.setPaintStyle({ lineWidth: 1, strokeStyle: lightGray });
          connection.endpoints[0].setPaintStyle({ fillStyle: lightGray });
          connection.endpoints[1].setVisible(false, true, true); // JUST set right endpoint to be invisible
          connection.canvas.style.zIndex = 0;
        }
      });

      // clear everything, then just activate $(this) one ...
      document.querySelectorAll(".stackFrame").forEach((frame) => {
        frame.classList.remove("selectedStackFrame");
      });
      document.querySelectorAll(".stackFrameHeader").forEach((header) => {
        header.classList.add("inactiveStackFrameHeader");
      });

      enclosingStackFrame.classList.add("selectedStackFrame");
      this.classList.remove("inactiveStackFrameHeader");
    });
  });

  // 'click' on the top-most stack frame if available,
  // or on "Global variables" otherwise
  if (stackGrowsUp) {
    document.getElementById("stack_header0").click();
  } else {
    document.getElementById("stack_header" + (curEntry.encoded_frames.length - 1)).click();
  }
}

function getObjectID(obj) {
  // pre-condition
  assert(typeof obj == "object" && obj != null);
  assert(Array.isArray(obj));

  if (obj[0] == "INSTANCE" || obj[0] == "CLASS") {
    return obj[2];
  } else {
    return obj[1];
  }
}

// render the JS data object obj inside of jDomElt,
// which is a jQuery wrapped DOM object
// (obj is in a format encoded by back_end/pg_encoder.py)
function renderData(obj, jDomElt, ignoreIDs) {
  // dispatch on types:
  var typ = typeof obj;

  if (obj == null) {
    jDomElt.innerHTML = '<span class="nullObj">None</span>';
  } else if (typ == "number") {
    jDomElt.innerHTML = '<span class="numberObj">' + obj + "</span>";
  } else if (typ == "boolean") {
    if (obj) {
      jDomElt.innerHTML = '<span class="boolObj">True</span>';
    } else {
      jDomElt.innerHTML = '<span class="boolObj">False</span>';
    }
  } else if (typ == "string") {
    jDomElt.innerHTML = '<span class="stringObj">"' + htmlspecialchars(obj).replaceAll('"', '\\"') + '"</span>';
  } else if (typ == "object") {
    var idStr = "";
    if (!ignoreIDs) {
      idStr = " (id=" + getObjectID(obj) + ")";
    }

    if (obj[0] == "LIST") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      if (obj.length == 2) {
        newDiv.innerText = "empty list" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.innerText = "list" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.classList.add("listTbl");
        table.innerHTML = "<tr></tr><tr></tr>";
        jDomElt.appendChild(table);
        var headerTr = table.querySelector("tr:first-child");
        var contentTr = table.querySelector("tr:last-child");
        obj.slice(2).forEach((val, ind) => {
          // create a new column for both header and content rows
          var headerCell = document.createElement("td");
          headerCell.classList.add("listHeader");
          headerCell.textContent = ind;
          headerTr.appendChild(headerCell);

          var contentCell = document.createElement("td");
          contentCell.classList.add("listElt");
          contentTr.appendChild(contentCell);

          // pass in the newly-added content cell to renderData
          renderData(val, contentCell, ignoreIDs);
        });
      }
    } else if (obj[0] == "TUPLE") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      if (obj.length == 2) {
        newDiv.innerText = "empty tuple" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.innerText = "tuple" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.classList.add("tupvarbl");
        table.innerHTML = "<tr></tr><tr></tr>";
        jDomElt.appendChild(table);
        var headerTr = table.querySelector("tr:first-child");
        var contentTr = table.querySelector("tr:last-child");
        obj.slice(2).forEach((val, ind) => {
          // create a new column for both header and content rows
          var headerCell = document.createElement("td");
          headerCell.classList.add("tupleHeader");
          headerCell.textContent = ind;
          headerTr.appendChild(headerCell);

          var contentCell = document.createElement("td");
          contentCell.classList.add("tupleElt");
          contentTr.appendChild(contentCell);

          // pass in the newly-added content cell to renderData
          renderData(val, contentCell, ignoreIDs);
        });
      }
    } else if (obj[0] == "SET") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      if (obj.length == 2) {
        newDiv.innerText = "empty set" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.innerText = "set" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.classList.add("setTbl");
        jDomElt.appendChild(table);
        // create an R x C matrix:
        var numElts = obj.length - 2;
        // gives roughly a 3x5 rectangular ratio, square is too, err,
        // 'square' and boring
        var numRows = Math.round(Math.sqrt(numElts));
        if (numRows > 3) {
          numRows -= 1;
        }

        var numCols = Math.round(numElts / numRows);
        // round up if not a perfect multiple:
        if (numElts % numRows) {
          numCols += 1;
        }

        obj.slice(2).forEach((val, ind) => {
          if (ind % numCols == 0) {
            var newTr = document.createElement("tr");
            table.appendChild(newTr);
          }

          var curTr = table.querySelector("tr:last-child");
          var newTd = document.createElement("td");
          newTd.classList.add("setElt");
          curTr.appendChild(newTd);
          renderData(val, curTr.querySelector("td:last-child"), ignoreIDs);
        });
      }
    } else if (obj[0] == "DICT") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      if (obj.length == 2) {
        newDiv.innerText = "empty dict" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.innerText = "dict" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.classList.add("dictTbl");
        jDomElt.appendChild(table);
        obj.slice(2).forEach((kvPair) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.classList.add("dictKey");

          var newValTd = document.createElement("td");
          newValTd.classList.add("dictVal");

          var newDictTr = document.createElement("tr");
          newDictTr.classList.add("dictEntry");
          newDictTr.appendChild(newKeyTd);
          newDictTr.appendChild(newValTd);

          table.appendChild(newDictTr);

          renderData(kvPair[0], newKeyTd, ignoreIDs);
          renderData(kvPair[1], newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "INSTANCE") {
      assert(obj.length >= 3);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      newDiv.innerText = obj[1] + " instance" + idStr;
      jDomElt.appendChild(newDiv);

      if (obj.length > 3) {
        var table = document.createElement("table");
        table.classList.add("instTbl");
        jDomElt.appendChild(table);
        obj.slice(3).forEach((kvPair) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.classList.add("instKey");

          var newValTd = document.createElement("td");
          newValTd.classList.add("instVal");

          var newInstTr = document.createElement("tr");
          newInstTr.classList.add("instEntry");
          newInstTr.appendChild(newKeyTd);
          newInstTr.appendChild(newValTd);

          table.appendChild(newInstTr);

          // the keys should always be strings, so render them directly (and without quotes):
          assert(typeof kvPair[0] == "string");
          newKeyTd.innerHTML += '<span class="keyObj">' + htmlspecialchars(kvPair[0]) + "</span>";

          // values can be arbitrary objects, so recurse:
          renderData(kvPair[1], newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "CLASS") {
      assert(obj.length >= 4);

      var newDiv = document.createElement("div");
      newDiv.classList.add("typeLabel");
      var superclassStr = "";
      if (obj[3].length > 0) {
        superclassStr += "[extends " + obj[3].join(",") + "] ";
      }

      newDiv.innerText = obj[1] + " class " + superclassStr + idStr;
      jDomElt.appendChild(newDiv);

      if (obj.length > 4) {
        var table = document.createElement("table");
        table.classList.add("classTbl");
        jDomElt.appendChild(table);
        obj.slice(4).forEach((kvPair) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.classList.add("classKey");

          var newValTd = document.createElement("td");
          newValTd.classList.add("classVal");

          var newClassTr = document.createElement("tr");
          newClassTr.classList.add("classEntry");
          newClassTr.appendChild(newKeyTd);
          newClassTr.appendChild(newValTd);

          table.appendChild(newClassTr);

          // the keys should always be strings, so render them directly (and without quotes):
          assert(typeof kvPair[0] == "string");
          newKeyTd.innerHTML += '<span class="keyObj">' + htmlspecialchars(kvPair[0]) + "</span>";

          // values can be arbitrary objects, so recurse:
          renderData(kvPair[1], newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "CIRCULAR_REF") {
      assert(obj.length == 2);

      var newDiv = document.createElement("div");
      newDiv.classList.add("circRefLabel");
      newDiv.innerText = "circular reference to id=" + obj[1];
      jDomElt.appendChild(newDiv);
    } else {
      // render custom data type
      assert(obj.length == 3);
      var typeName = obj[0];
      var id = obj[1];
      var strRepr = obj[2];

      // if obj[2] is like '<generator object <genexpr> at 0x84760>',
      // then display an abbreviated version rather than the gory details
      noStrReprRE = /<.* at 0x.*>/;
      if (noStrReprRE.test(strRepr)) {
        var customObjSpan = document.createElement("span");
        customObjSpan.className = "customObj";
        customObjSpan.textContent = typeName + idStr;
        jDomElt.appendChild(customObjSpan);
      } else {
        strRepr = htmlspecialchars(strRepr); // escape strings!

        // warning: we're overloading tuple elts for custom data types
        var typeLabelDiv = document.createElement("div");
        typeLabelDiv.className = "typeLabel";
        typeLabelDiv.textContent = typeName + idStr + ":";
        jDomElt.appendChild(typeLabelDiv);

        var table = document.createElement("table");
        table.className = "tupvarbl";
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.className = "tupleElt";
        cell.textContent = strRepr;
        row.appendChild(cell);
        table.appendChild(row);
        jDomElt.appendChild(table);
      }
    }
  }
}

function renderPyCodeOutput(codeStr) {
  var tbl = document.getElementById("pyCodeOutput");
  tbl.innerHTML = ""; // Clear table content

  codeStr.split("\n").forEach((cod, i) => {
    // Create table row
    var newRow = document.createElement("tr");
    newRow.innerHTML = '<td class="lineNo"></td><td class="cod"></td>';
    newRow.querySelector(".lineNo").textContent = i + 1;
    newRow.querySelector(".cod").innerText = htmlspecialchars(cod.replace(/\s+$/, ""));

    tbl.appendChild(newRow);
  });
}

function loadExample() {
  const selectedOption = document.getElementById("selectExample").value;
  // TODO: add switching possibility
  if (selectedOption) {
    fetch("../example_code/" + selectedOption)
      .then((response) => response.text())
      .then((data) => document.getElementById("pyInput").value = data)
      .catch((error) => console.error("Error fetching data:", error));
  }
}

// initialization function that should be called when the page is loaded
function eduPythonCommonInit() {
  document.getElementById("jmpFirstInstr").addEventListener("click", function () {
    curInstr = 0;
    updateOutput();
  });

  document.getElementById("jmpLastInstr").addEventListener("click", function () {
    curInstr = curTrace.length - 1;
    updateOutput();
  });

  document.getElementById("jmpStepBack").addEventListener("click", function () {
    if (curInstr > 0) {
      curInstr -= 1;
      updateOutput();
    }
  });

  document.getElementById("jmpStepFwd").addEventListener("click", function () {
    if (curInstr < curTrace.length - 1) {
      curInstr += 1;
      updateOutput();
    }
  });

  // Build the dropdowns with filenames
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

  const selectQuestionBox = document.getElementById("selectQuestion");
  fetch("../questions/")
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((filename) => {
          const option = document.createElement("option");
          option.textContent = filename.split(".")[0];
          selectQuestionBox.appendChild(option);
        });
      }
    })
    .catch((error) => console.error("Error fetching filenames:", error));

  // disable controls initially ...
  document.getElementById("jmpFirstInstr").disabled = true;
  document.getElementById("jmpStepBack").disabled = true;
  document.getElementById("jmpStepFwd").disabled = true;
  document.getElementById("jmpLastInstr").disabled = true;

  // set some sensible jsPlumb defaults
  jsPlumb.Defaults.Endpoint = ["Dot", { radius: 3 }];
  //jsPlumb.Defaults.Endpoint = ["Rectangle", {width:3, height:3}];
  jsPlumb.Defaults.EndpointStyle = { fillStyle: lightGray };
  jsPlumb.Defaults.Anchors = ["RightMiddle", "LeftMiddle"];
  jsPlumb.Defaults.Connector = ["Bezier", { curviness: 15 }];
  jsPlumb.Defaults.PaintStyle = { lineWidth: 1, strokeStyle: lightGray };

  // experiment with arrows ...
  jsPlumb.Defaults.Overlays = [["Arrow", { length: 14, width: 10, foldback: 0.55, location: 0.35 }]];

  jsPlumb.Defaults.EndpointHoverStyle = { fillStyle: pinkish };
  jsPlumb.Defaults.HoverPaintStyle = { lineWidth: 2, strokeStyle: pinkish };

  // set keyboard event listeners ...
  document.addEventListener("keydown", (k) => {
    // ONLY capture keys if we're in 'visualize code' mode:
    if (appMode == "visualize") {
      if (k.key == "ArrowLeft") {
        // left arrow
        if (!document.getElementById("jmpStepBack").disabled) {
          document.getElementById("jmpStepBack").click();
          k.preventDefault(); // don't horizontally scroll the display
        }
      } else if (k.key == "ArrowRight") {
        // right arrow
        if (!document.getElementById("jmpStepFwd").disabled) {
          document.getElementById("jmpStepFwd").click();
          k.preventDefault(); // don't horizontally scroll the display
        }
      }
    }
  });

  // redraw everything on window resize so that connectors are in the
  // right place
  // TODO: can be SLOW on older browsers!!!
  window.addEventListener("resize", function () {
    if (appMode == "visualize") {
      updateOutput();
    }
  });

  document.getElementById("stackGrowthSelector").addEventListener("click", function () {
    if (appMode == "visualize") {
      updateOutput();
    }
  });

  document.getElementById("classicModeCheckbox").addEventListener("click", function () {
    if (appMode == "visualize") {
      updateOutput();
    }
  });
}
