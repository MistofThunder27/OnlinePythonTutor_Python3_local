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
var encodedFrames;

// true iff trace ended prematurely since maximum instruction limit has been reached
var instrLimitReached = false;

function assert(cond) {
  if (!cond) {
    alert("Error: ASSERTION FAILED");
  }
}

// taken from http://www.toao.net/32-my-htmlSpecialChars-function-for-javascript and modified
function htmlSpecialChars(str) {
  return str.replace(
    /[&<> \n]/g,
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
    const lastEntry = curTrace[curTrace.length - 1];

    // GLOBAL!
    instrLimitReached = lastEntry.event == "instruction_limit_reached";

    if (instrLimitReached) {
      curTrace.pop(); // kill last entry which only has the error message
      const errorOutput = document.getElementById("errorOutput");
      errorOutput.innerHTML = htmlSpecialChars(lastEntry.exception_msg);
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

  const curEntry = curTrace[curInstr];
  const totalInstrs = curTrace.length;

  // render VCR controls:
  const vcrControls = document.getElementById("vcrControls");

  // to be user-friendly, if we're on the LAST instruction, print "Program has terminated"
  // and DON'T highlight any lines of code in the code display
  vcrControls.querySelector("#curInstr").innerHTML =
    curInstr === totalInstrs - 1
      ? instrLimitReached
        ? "Instruction limit reached"
        : "Program has terminated"
      : "About to do step " + (curInstr + 1) + " of " + (totalInstrs - 1);

  vcrControls.querySelector("#jmpFirstInstr").disabled =
    vcrControls.querySelector("#jmp1StepBack").disabled = curInstr === 0;
  vcrControls.querySelector("#jmp5StepBack").disabled = curInstr < 5;
  vcrControls.querySelector("#jmp25StepBack").disabled = curInstr < 25;
  vcrControls.querySelector("#jmpLastInstr").disabled =
    vcrControls.querySelector("#jmp1StepFwd").disabled =
      curInstr === totalInstrs - 1;
  vcrControls.querySelector("#jmp5StepFwd").disabled =
    curInstr > totalInstrs - 6;
  vcrControls.querySelector("#jmp25StepFwd").disabled =
    curInstr > totalInstrs - 26;

  // render error (if applicable):
  const errorOutput = document.getElementById("errorOutput");
  var hasError;
  if (
    curEntry.event === "exception" ||
    curEntry.event === "uncaught_exception"
  ) {
    assert(curEntry.exception_msg);
    errorOutput.innerHTML = htmlSpecialChars(curEntry.exception_msg);
    errorOutput.style.display = "block";
    hasError = true;
  } else {
    errorOutput.style.display = "none";
    hasError = false;
  }

  // render code output: --
  const tbl = document.querySelector("table#pyCodeOutput");
  const tblAllLineNo = tbl.querySelectorAll("td.lineNo");
  const tblAllCod = tbl.querySelectorAll("td.cod");

  // Reset color and font-weight of line number cells
  tblAllLineNo.forEach((cell) => {
    cell.style.color = "";
    cell.style.fontWeight = "";
  });
  // Reset background color of code lines
  tblAllCod.forEach((line) => {
    line.style.backgroundColor = "";
    line.innerHTML = line.innerHTML
      .replace(/<br\/?>.*$/g, "")
      .replace(/<span.*?>(.*?)<\/span>/g, "$1");
  });

  const {
    line_group: lineGroup,
    caller_info: callerInfo,
    visited_lines: visitedLines,
  } = curEntry;
  // to make global
  encodedFrames = curEntry.encoded_frames;

  // set vertical scroll
  const lineAverage = lineGroup.reduce((a, b) => a + b);
  const scrollControl = [lineAverage - 25, lineAverage - 8, lineAverage].map(
    (n) => {
      return n / (lineGroup.length * tblAllLineNo.length);
    }
  );

  const pyCodeOutputDiv = document.getElementById("pyCodeOutputDiv");
  const curScrollRatio =
    pyCodeOutputDiv.scrollTop / pyCodeOutputDiv.scrollHeight;

  if (scrollControl[0] > curScrollRatio || scrollControl[2] < curScrollRatio) {
    pyCodeOutputDiv.scrollTop = scrollControl[1] * pyCodeOutputDiv.scrollHeight;
  }

  // Set visited lines
  if (visitedLines) {
    visitedLines.forEach((line) => {
      const lineNoCell = tblAllLineNo[line - 1];
      lineNoCell.style.color = visitedLineColor;
      lineNoCell.style.fontWeight = "bold";
    });
  }

  // Highlight and duplicate calling function:
  if (callerInfo) {
    const {
      code: evaluatedCode,
      line_group: callingLines,
      true_positions: [startLine, startIndex, endLine, endIndex],
      relative_positions: [relativeStart, relativeEnd],
    } = callerInfo;

    const callingLineColor =
      encodedFrames.length % 2 == 1 ? callingLineColor1 : callingLineColor2;
    callingLines.forEach((line) => {
      tblAllCod[line - 1].style.backgroundColor = callingLineColor;
    });

    var cell, content;
    if (startLine === endLine) {
      cell = tblAllCod[startLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        content.substring(0, startIndex) +
        '<span style="background-color: orange;">' +
        content.substring(startIndex, endIndex) +
        "</span>" +
        content.substring(endIndex);
    } else {
      cell = tblAllCod[startLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        content.substring(0, startIndex) +
        '<span style="background-color: orange;">' +
        content.substring(startIndex) +
        "</span>";

      for (var line = startLine + 1; line <= endLine - 1; line++) {
        cell = tblAllCod[line - 1];
        cell.innerHTML =
          '<span style="background-color: orange;">' +
          cell.textContent +
          "</span>";
      }

      cell = tblAllCod[endLine - 1];
      content = cell.textContent;
      cell.innerHTML =
        '<span style="background-color: orange;">' +
        content.substring(0, endIndex) +
        "</span>" +
        content.substring(endIndex);
    }

    tblAllCod[callingLines[callingLines.length - 1] - 1].innerHTML +=
      '<br/><span style="font-style: italic; color: green;">' +
      htmlSpecialChars(evaluatedCode.substring(0, relativeStart)) +
      '<span style="background-color: orange;">' +
      htmlSpecialChars(evaluatedCode.substring(relativeStart, relativeEnd)) +
      "</span>" +
      htmlSpecialChars(evaluatedCode.substring(relativeEnd)) +
      "</span>";
  }

  // Highlight curLineGroup:
  if (lineGroup) {
    lineGroup.forEach((line) => {
      tblAllCod[line - 1].style.backgroundColor = hasError
        ? errorColor
        : !instrLimitReached && curInstr === totalInstrs - 1
        ? terminatingColor
        : lightLineColor;
    });
  }

  // render stdout:
  const stdoutElement = document.getElementById("pyStdout");

  // keep original horizontal scroll level:
  const oldLeft = stdoutElement.scrollLeft;
  stdoutElement.value = curEntry.stdout;
  stdoutElement.scrollLeft = oldLeft;
  // scroll to bottom, though:
  stdoutElement.scrollTop = stdoutElement.scrollHeight;

  // finally, render all the data structures!!!
  renderDataVizDiv();
}

function renderDataVizDiv() {
  const inlineRendering = document.getElementById(
    "inlineRenderingCheckbox"
  ).checked;
  const stackGrowsUp = document.getElementById("stackGrowUpCheckbox").checked;

  const dataViz = document.getElementById("dataViz");
  dataViz.innerHTML = ""; // Clear the content

  // organize frames based on settings
  if (encodedFrames) {
    var orderedFrames = encodedFrames.slice();
    if (stackGrowsUp) {
      orderedFrames = orderedFrames.reverse();
    }

    if (inlineRendering) {
      orderedFrames.forEach(([frameName, frameContent]) => {
        const vizFrame = document.createElement("div");
        vizFrame.className = "vizFrame";
        vizFrame.innerText = htmlSpecialChars(frameName) + " variables:";
        vizFrame.appendChild(document.createElement("br"));

        const encodedVars = Object.entries(frameContent);
        if (encodedVars.length > 0) {
          const frameDataViz = document.createElement("table");
          frameDataViz.className = "frameDataViz";
          vizFrame.appendChild(frameDataViz);

          encodedVars.forEach(([varname, val]) => {
            const tr = document.createElement("tr");
            frameDataViz.appendChild(tr);

            const varnameTd = document.createElement("td");
            tr.appendChild(varnameTd);
            varnameTd.className = "varname";
            varnameTd.innerHTML =
              varname === "__return__"
                ? '<span style="font-size: 10pt; font-style: italic;">return value</span>'
                : varname;

            const valTd = document.createElement("td");
            tr.appendChild(valTd);
            valTd.className = "val";
            renderData(val, valTd, false);
          });

          const lastRow = frameDataViz.lastElementChild;
          lastRow.querySelector("td:first-child").style.borderBottom = "0px";
          lastRow.querySelector("td:last-child").style.borderBottom = "0px";
        } else {
          const noneText = document.createElement("i");
          noneText.innerText = "none";
          vizFrame.appendChild(noneText);
        }
        dataViz.appendChild(vizFrame);
      });
    } else {
      // before we wipe out the old state of the visualization, CLEAR all
      // the click listeners first
      document.querySelectorAll(".stackFrameHeader").forEach((header) => {
        header.removeEventListener("click", handleClick);
      });

      var stackHeapTable = document.createElement("table");
      stackHeapTable.id = "stackHeapTable";

      var tr = document.createElement("tr");

      var stack_td = document.createElement("td");
      stack_td.id = "stack_td";

      var stack_master_div = document.createElement("div");
      stack_master_div.id = "stack";
      stack_td.appendChild(stack_master_div);
      tr.appendChild(stack_td);

      var heap_td = document.createElement("td");
      heap_td.id = "heap_td";

      var heap_master_div = document.createElement("div");
      heap_master_div.id = "heap";
      heap_td.appendChild(heap_master_div);
      tr.appendChild(heap_td);

      stackHeapTable.appendChild(tr);
      dataViz.appendChild(stackHeapTable);

      // Key:   CSS ID of the div element representing the variable
      // Value: CSS ID of the div element representing the value rendered in the heap
      var connectionEndpointIDs = {};

      // first render the vars
      orderedFrames.forEach(([frameName, frameContent], i) => {
        var stackDiv = document.createElement("div");
        var divID = "stack" + i;
        stackDiv.className = "stackFrame";
        stackDiv.id = divID;
        stack_master_div.appendChild(stackDiv);

        var headerDiv = document.createElement("div");
        headerDiv.id = "stack_header" + i;
        headerDiv.className = "stackFrameHeader inactiveStackFrameHeader";
        headerDiv.innerHTML = htmlSpecialChars(frameName);
        stackDiv.appendChild(headerDiv);

        var encodedVars = Object.entries(frameContent);
        if (encodedVars.length > 0) {
          var table = document.createElement("table");
          table.className = "stackFrameVarTable";
          table.id = divID + "_table";
          stackDiv.appendChild(table);

          encodedVars.forEach(([varname, val]) => {
            var tr = document.createElement("tr");
            // special treatment for displaying return value and indicating
            // that the function is about to return to its caller
            if (varname == "__return__") {
              tr.innerHTML =
                '<td colspan="2" class="returnWarning">About to return to caller</td>';
              table.appendChild(tr);
              tr = document.createElement("tr");
              tr.innerHTML =
                '<td class="stackFrameVar"><span class="retval">Return value:</span></td><td class="stackFrameValue"></td>';
            } else {
              tr.innerHTML =
                '<td class="stackFrameVar">' +
                varname +
                '</td><td class="stackFrameValue"></td>';
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
              var varDivID =
                divID +
                "__" +
                varname
                  .replace(/[\[{|(<>]/g, "LeftB_")
                  .replace(/[\]}|)<>]/g, "_RightB");
              var divElement = document.createElement("div");
              divElement.id = varDivID;
              divElement.innerHTML = "&nbsp;";
              tr.querySelector("td.stackFrameValue").appendChild(divElement);

              if (connectionEndpointIDs[varDivID] === undefined) {
                connectionEndpointIDs[varDivID] = "heap_object_" + val[1]; // val[1] is object ID
              }
            }
          });
        }
      });

      // then render the heap
      var heapHeaderDiv = document.createElement("div");
      heapHeaderDiv.id = "heapHeader";
      heapHeaderDiv.textContent = "Heap";
      heap_master_div.appendChild(heapHeaderDiv);

      // if there are multiple aliases to the same object, we want to render
      // the one deepest in the stack, so that we can hopefully prevent
      // objects from jumping around as functions are called and returned.
      // e.g., if a list L appears as a global variable and as a local in a
      // function, we want to render L when rendering the global frame.

      var alreadyRenderedObjectIDs = new Set(); // set of object IDs that have already been rendered
      encodedFrames.forEach((frame) => {
        Object.entries(frame[1]).forEach((entry) => {
          var val = entry[1];
          // primitive types are already rendered in the stack
          if (typeof val == "object" && val != null) {
            var objectID = val[1];

            if (!alreadyRenderedObjectIDs.has(objectID)) {
              var heapObjID = "heap_object_" + objectID;
              dataViz.querySelector("#heap").innerHTML +=
                '<div class="heapObject" id="' + heapObjID + '"></div>';
              renderData(
                val,
                dataViz.querySelector("#heap #" + heapObjID),
                false
              );

              alreadyRenderedObjectIDs.add(objectID);
            }
          }
        });
      });

      // finally connect stack variables to heap objects
      // add an on-click listener to all stack frame headers
      document.querySelectorAll(".stackFrameHeader").forEach((header) => {
        header.addEventListener("click", function () {
          const selectedEnclosingStackFrame = this.parentNode;

          //Clear all canvases
          document.querySelectorAll("canvas").forEach((oldCanvas) => {
            dataViz.removeChild(oldCanvas);
          });

          // Draw connections based on the connectionEndpointIDs object
          Object.entries(connectionEndpointIDs).forEach(
            ([sourceID, targetID]) => {
              const sourceElem = document.getElementById(sourceID);
              const sourceRect = sourceElem.getBoundingClientRect();
              const targetRect = document
                .getElementById(targetID)
                .getBoundingClientRect();

              // Find the parent stackFrame of the source element and highlight if
              // the stackFrame ID matches the selectedStackFrame ID
              // IMPORTANT: assumes stackFrame is 5 elements up!!!!!
              const isSelectedFrame =
                sourceElem.parentElement.parentElement.parentElement
                  .parentElement.id ===
                selectedEnclosingStackFrame.getAttribute("id");

              // Draw a line from the source element to the target element
              // add 5 pixels of buffer on both sides
              const fromX = sourceRect.right - 5 + window.scrollX;
              const toX = targetRect.left + 5 + window.scrollX;
              const diffX = toX - fromX;
              const midX = diffX / 2;

              const lineColor = isSelectedFrame ? "darkBlue" : "lightGray";

              const canvas = document.createElement("canvas");
              canvas.style.zIndex = isSelectedFrame ? 1 : 0;

              canvas.style.left = fromX + "px";
              canvas.width = diffX;

              // as heap item can be above or bellow stack item, use if statement to correctly add 5 pixels of buffer on both sides
              const fromY =
                sourceRect.top + sourceRect.height / 2 + window.scrollY;
              const toY =
                targetRect.top + targetRect.height / 2 + window.scrollY;
              if (fromY < toY) {
                var diffY = toY - fromY + 10;
                canvas.style.top = fromY - 5 + "px";
              } else {
                var diffY = fromY - toY + 10;
                canvas.style.top = toY - 5 + "px";
              }
              const midY = diffY / 2;
              canvas.height = diffY;

              // Draw the curved line
              const ctx = canvas.getContext("2d");
              ctx.strokeStyle = ctx.fillStyle = lineColor;
              ctx.lineWidth = isSelectedFrame ? 2 : 1;
              ctx.beginPath();
              if (fromY < toY) {
                ctx.fillRect(3, 3, 4, 4);
                ctx.moveTo(5, 5);
                ctx.bezierCurveTo(
                  midX,
                  5,
                  midX,
                  diffY - 5,
                  diffX - 5,
                  diffY - 5
                );
              } else {
                ctx.fillRect(3, diffY - 7, 4, 4);
                ctx.moveTo(5, diffY - 5);
                ctx.bezierCurveTo(midX, diffY - 5, midX, 5, diffX - 5, 5);
              }
              ctx.stroke();

              // Draw the arrowhead at the midpoint
              const size = 10; // Arrowhead size

              // Calculate the angle of the line at mid point - found and simplified mathematically
              const angle = Math.atan2(2 * (toY - fromY), diffX - 10);

              // Calculate the points for the arrowhead
              const arrowX1 = midX - size * Math.cos(angle - Math.PI / 6);
              const arrowY1 = midY - size * Math.sin(angle - Math.PI / 6);

              const arrowX2 = midX - size * Math.cos(angle + Math.PI / 6);
              const arrowY2 = midY - size * Math.sin(angle + Math.PI / 6);

              // Draw the arrowhead
              ctx.beginPath();
              ctx.moveTo(midX, midY);
              ctx.lineTo(arrowX1, arrowY1);
              ctx.lineTo(arrowX2, arrowY2);
              ctx.closePath();
              ctx.fillStyle = lineColor;
              ctx.fill();

              dataViz.appendChild(canvas);
            }
          );

          // clear everything, then just activate selectedEnclosingStackFrame
          document.querySelectorAll(".stackFrame").forEach((frame) => {
            frame.classList.remove("selectedStackFrame");
          });
          document.querySelectorAll(".stackFrameHeader").forEach((header) => {
            header.classList.add("inactiveStackFrameHeader");
          });

          selectedEnclosingStackFrame.classList.add("selectedStackFrame");
          this.classList.remove("inactiveStackFrameHeader");
        });
      });

      // 'click' on the top-most stack frame if available,
      // or on "Global variables" otherwise
      if (stackGrowsUp) {
        document.getElementById("stack_header0").click();
      } else {
        document
          .getElementById("stack_header" + (encodedFrames.length - 1))
          .click();
      }
    }
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
    jDomElt.innerHTML =
      '<span class="stringObj">"' +
      htmlSpecialChars(obj).replaceAll('"', '\\"') +
      '"</span>';
  } else if (typ == "object") {
    var idStr = "";
    if (!ignoreIDs) {
      idStr = " (id=" + obj[1] + ")";
    }

    if (obj[0] == "LIST") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      if (obj.length == 2) {
        newDiv.textContent = "empty list" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.textContent = "list" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.className = "listTbl";
        table.innerHTML = "<tr></tr><tr></tr>";
        jDomElt.appendChild(table);
        var headerTr = table.querySelector("tr:first-child");
        var contentTr = table.querySelector("tr:last-child");
        obj.slice(2).forEach((val, ind) => {
          // create a new column for both header and content rows
          var headerCell = document.createElement("td");
          headerCell.className = "listHeader";
          headerCell.textContent = ind;
          headerTr.appendChild(headerCell);

          var contentCell = document.createElement("td");
          contentCell.className = "listElt";
          contentTr.appendChild(contentCell);

          // pass in the newly-added content cell to renderData
          renderData(val, contentCell, ignoreIDs);
        });
      }
    } else if (obj[0] == "TUPLE") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      if (obj.length == 2) {
        newDiv.textContent = "empty tuple" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.textContent = "tuple" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.className = "tupleTbl";
        table.innerHTML = "<tr></tr><tr></tr>";
        jDomElt.appendChild(table);
        var headerTr = table.querySelector("tr:first-child");
        var contentTr = table.querySelector("tr:last-child");
        obj.slice(2).forEach((val, ind) => {
          // create a new column for both header and content rows
          var headerCell = document.createElement("td");
          headerCell.className = "tupleHeader";
          headerCell.textContent = ind;
          headerTr.appendChild(headerCell);

          var contentCell = document.createElement("td");
          contentCell.className = "tupleElt";
          contentTr.appendChild(contentCell);

          // pass in the newly-added content cell to renderData
          renderData(val, contentCell, ignoreIDs);
        });
      }
    } else if (obj[0] == "SET") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      if (obj.length == 2) {
        newDiv.textContent = "empty set" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.textContent = "set" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.className = "setTbl";
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
          newTd.className = "setElt";
          curTr.appendChild(newTd);
          renderData(val, curTr.querySelector("td:last-child"), ignoreIDs);
        });
      }
    } else if (obj[0] == "DICT") {
      assert(obj.length >= 2);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      if (obj.length == 2) {
        newDiv.textContent = "empty dict" + idStr;
        jDomElt.appendChild(newDiv);
      } else {
        newDiv.textContent = "dict" + idStr + ":";
        jDomElt.appendChild(newDiv);

        var table = document.createElement("table");
        table.className = "dictTbl";
        jDomElt.appendChild(table);
        obj.slice(2).forEach(([key, val]) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.className = "dictKey";

          var newValTd = document.createElement("td");
          newValTd.className = "dictVal";

          var newDictTr = document.createElement("tr");
          newDictTr.className = "dictEntry";
          newDictTr.appendChild(newKeyTd);
          newDictTr.appendChild(newValTd);

          table.appendChild(newDictTr);

          renderData(key, newKeyTd, ignoreIDs);
          renderData(val, newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "FUNC") {
      assert(obj.length >= 3);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      newDiv.textContent = "function" + idStr;
      jDomElt.appendChild(newDiv);

      if (obj.length > 3) {
        var table = document.createElement("table");
        table.className = "funcTbl";
        jDomElt.appendChild(table);
        const tr = document.createElement("tr");
        table.appendChild(tr);
        obj.slice(3).forEach(([arg, annotation, def]) => {
          const td = document.createElement("td");
          td.className = "funcArg";
          td.innerHTML =
            '<span class="keyObj">' + htmlSpecialChars(arg) + "</span>";
          if (annotation) {
            td.innerHTML +=
              " <span style='color: red;'>(" + annotation + ")</span>";
          }
          if (def) {
            td.appendChild(document.createElement("br"));
            td.innerHTML += "defaults to: ";
            defaultDiv = document.createElement("div");
            defaultDiv.className = "funcDef";
            td.appendChild(defaultDiv);
            renderData(def, defaultDiv, ignoreIDs);
          }
          tr.appendChild(td);
        });
        if (obj[2]) {
          returnsTd = document.createElement("td");
          returnsTd.className = "funcArg";
          returnsTd.innerHTML =
            "returns: <span style='color: red;'>(" + obj[2] + ")</span>";
          tr.appendChild(returnsTd);
        }
      }
    } else if (obj[0] == "INSTANCE") {
      assert(obj.length >= 3);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      newDiv.textContent = obj[2] + " instance" + idStr;
      jDomElt.appendChild(newDiv);

      if (obj.length > 3) {
        var table = document.createElement("table");
        table.className = "instTbl";
        jDomElt.appendChild(table);
        obj.slice(3).forEach(([key, val]) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.className = "instKey";

          var newValTd = document.createElement("td");
          newValTd.className = "instVal";

          var newInstTr = document.createElement("tr");
          newInstTr.className = "instEntry";
          newInstTr.appendChild(newKeyTd);
          newInstTr.appendChild(newValTd);

          table.appendChild(newInstTr);

          // the keys should always be strings, so render them directly (and without quotes):
          assert(typeof key == "string");
          newKeyTd.innerHTML +=
            '<span class="keyObj">' + htmlSpecialChars(key) + "</span>";

          // values can be arbitrary objects, so recurse:
          renderData(val, newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "CLASS") {
      assert(obj.length >= 4);

      var newDiv = document.createElement("div");
      newDiv.className = "typeLabel";
      var superclassStr = "";
      if (obj[3].length > 0) {
        superclassStr += "[extends " + obj[3].join(",") + "] ";
      }

      newDiv.textContent = obj[2] + " class " + superclassStr + idStr;
      jDomElt.appendChild(newDiv);

      if (obj.length > 4) {
        var table = document.createElement("table");
        table.className = "classTbl";
        jDomElt.appendChild(table);
        obj.slice(4).forEach(([key, val]) => {
          var newKeyTd = document.createElement("td");
          newKeyTd.className = "classKey";

          var newValTd = document.createElement("td");
          newValTd.className = "classVal";

          var newClassTr = document.createElement("tr");
          newClassTr.className = "classEntry";
          newClassTr.appendChild(newKeyTd);
          newClassTr.appendChild(newValTd);

          table.appendChild(newClassTr);

          // the keys should always be strings, so render them directly (and without quotes):
          assert(typeof key == "string");
          newKeyTd.innerHTML +=
            '<span class="keyObj">' + htmlSpecialChars(key) + "</span>";

          // values can be arbitrary objects, so recurse:
          renderData(val, newValTd, ignoreIDs);
        });
      }
    } else if (obj[0] == "CIRCULAR_REF") {
      assert(obj.length == 2);

      var newDiv = document.createElement("div");
      newDiv.className = "circRefLabel";
      newDiv.textContent = "circular reference to id=" + obj[1];
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
        strRepr = htmlSpecialChars(strRepr); // escape strings!

        // warning: we're overloading tuple elts for custom data types
        var typeLabelDiv = document.createElement("div");
        typeLabelDiv.className = "typeLabel";
        typeLabelDiv.textContent = typeName + idStr + ":";
        jDomElt.appendChild(typeLabelDiv);

        var table = document.createElement("table");
        table.className = "tupleTbl";
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
    const newRow = document.createElement("tr");

    const lineNoTd = document.createElement("td");
    lineNoTd.className = "lineNo";
    lineNoTd.textContent = i + 1;

    const codTd = document.createElement("td");
    codTd.className = "cod";
    codTd.innerHTML = htmlSpecialChars(cod.replace(/\s+$/, ""));

    newRow.appendChild(lineNoTd);
    newRow.appendChild(codTd);
    tbl.appendChild(newRow);
  });
}

function addTabSupport(textElement) {
  textElement.addEventListener("keydown", (k) => {
    //TODO: change to proper tab
    if (k.key === "Tab") {
      k.preventDefault();
      var start = textElement.selectionStart;
      var end = textElement.selectionEnd;

      if (k.shiftKey) {
        var lines = textElement.value.substring(start, end).split("\n");
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("    ")) {
            lines[i] = lines[i].substring(4);
          }
        }
        textElement.value =
          textElement.value.substring(0, start) +
          lines.join("\n") +
          textElement.value.substring(end);
        textElement.selectionStart = textElement.selectionEnd = start - 4;
      } else {
        textElement.value =
          textElement.value.substring(0, start) +
          "    " +
          textElement.value.substring(end);
        textElement.selectionStart = textElement.selectionEnd = start + 4;
      }
    }
  });
}

// initialization function that should be called when the page is loaded
function eduPythonCommonInit() {
  document
    .getElementById("jmpFirstInstr")
    .addEventListener("click", function () {
      curInstr = 0;
      updateOutput();
    });

  document
    .getElementById("jmpLastInstr")
    .addEventListener("click", function () {
      curInstr = curTrace.length - 1;
      updateOutput();
    });

  document
    .getElementById("jmp1StepBack")
    .addEventListener("click", function () {
      if (curInstr > 0) {
        curInstr -= 1;
        updateOutput();
      }
    });

  document
    .getElementById("jmp5StepBack")
    .addEventListener("click", function () {
      if (curInstr > 4) {
        curInstr -= 5;
        updateOutput();
      }
    });

  document
    .getElementById("jmp25StepBack")
    .addEventListener("click", function () {
      if (curInstr > 24) {
        curInstr -= 25;
        updateOutput();
      }
    });

  document.getElementById("jmp1StepFwd").addEventListener("click", function () {
    if (curInstr < curTrace.length - 1) {
      curInstr += 1;
      updateOutput();
    }
  });

  document.getElementById("jmp5StepFwd").addEventListener("click", function () {
    if (curInstr < curTrace.length - 6) {
      curInstr += 5;
      updateOutput();
    }
  });

  document
    .getElementById("jmp25StepFwd")
    .addEventListener("click", function () {
      if (curInstr < curTrace.length - 26) {
        curInstr += 25;
        updateOutput();
      }
    });

  document
    .getElementById("jmpToStepBtn")
    .addEventListener("click", function () {
      const inputValue = document.getElementById("jmpToStepText").value;
      if (!isNaN(inputValue) && Number.isInteger(parseFloat(inputValue))) {
        const number = parseInt(inputValue) - 1;
        if (number >= 0 && number <= curTrace.length - 1) {
          curInstr = number;
          updateOutput();
        }
      }
    });

  document
    .getElementById("jmpFwdToLineBtn")
    .addEventListener("click", function () {
      const inputValue = document.getElementById("jmpFwdToLineText").value;
      if (!isNaN(inputValue) && Number.isInteger(parseFloat(inputValue))) {
        const lineNumber = parseInt(inputValue);
        if (lineNumber >= 1 && curInstr <= curTrace.length - 2) {
          curInstr += 1;
          while (
            curInstr <= curTrace.length - 2 &&
            !curTrace[curInstr].line_group.includes(lineNumber)
          ) {
            curInstr += 1;
          }
          updateOutput();
        }
      }
    });

  document
    .getElementById("jmpBackToLineBtn")
    .addEventListener("click", function () {
      const inputValue = document.getElementById("jmpBackToLineText").value;
      if (!isNaN(inputValue) && Number.isInteger(parseFloat(inputValue))) {
        const lineNumber = parseInt(inputValue);
        if (lineNumber >= 1 && curInstr >= 1) {
          curInstr -= 1;
          while (
            curInstr >= 1 &&
            !curTrace[curInstr].line_group.includes(lineNumber)
          ) {
            curInstr -= 1;
          }
          updateOutput();
        }
      }
    });

  // disable controls initially ...
  document.getElementById("jmpFirstInstr").disabled = true;
  document.getElementById("jmp1StepBack").disabled = true;
  document.getElementById("jmp5StepBack").disabled = true;
  document.getElementById("jmp25StepBack").disabled = true;
  document.getElementById("jmp1StepFwd").disabled = true;
  document.getElementById("jmp5StepFwd").disabled = true;
  document.getElementById("jmp25StepFwd").disabled = true;
  document.getElementById("jmpLastInstr").disabled = true;

  // set keyboard event listeners ...
  document.addEventListener("keydown", (k) => {
    // ONLY capture keys if we're in 'visualize code' mode:
    if (appMode == "visualize") {
      if (k.key == "ArrowLeft") {
        // left arrow
        if (!document.getElementById("jmp1StepBack").disabled) {
          document.getElementById("jmp1StepBack").click();
          k.preventDefault(); // don't horizontally scroll the display
        }
      } else if (k.key == "ArrowRight") {
        // right arrow
        if (!document.getElementById("jmp1StepFwd").disabled) {
          document.getElementById("jmp1StepFwd").click();
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
      renderDataVizDiv();
    }
  });

  document
    .getElementById("stackGrowUpCheckbox")
    .addEventListener("click", function () {
      if (appMode == "visualize") {
        renderDataVizDiv();
      }
    });

  document
    .getElementById("inlineRenderingCheckbox")
    .addEventListener("click", function () {
      if (appMode == "visualize") {
        renderDataVizDiv();
      }
    });
}
