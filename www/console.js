$( document ).ready(function() {
    var out = $("#outputScreenTextField");
    var input = $("#userInput");
    var varScreen = $("#variableScreen");
    var variables = [];

    out.val("<--> TERMINAL <-->");

    getPadding = function(startLength, targetLength) {
        let padding = "";
        while((startLength + padding.length) < targetLength) {
            padding += " ";
        }
        return padding;
    }

    insertVariable = function(_name, _value) {

        for(let i = 0; i < variables.length; i++) {
            if(variables[i].name == _name) {
                variables[i].value = _value;
                return;
            }
        }

        variables.unshift({
            name: _name,
            value: _value
        })
    }
    getVariable = function(_name) {
        for(let i = 0; i < variables.length; i++) {
            if(variables[i].name == _name) {
                return variables[i];
            }
        }
        return null;
    }
    removeVariable = function(_name) {
        let idxFound = -1;
        variables.forEach(function(val, idx) {
            if(val.name === _name) {
                idxFound = idx;
            }
        })

        if(idxFound >= 0) {
            variables.splice(idxFound, 1);
        }
        return idxFound >= 0;
    }
    refreshVariableList = function() {
        varScreen.empty();
        
        let newContent = "";
        newContent += "<ul>"
        for(let i = 0; i < variables.length; i ++) {
            newContent += "<li>[" + variables[i].name + "] => " + variables[i].value + "</li>";
        }
        newContent += "</ul>";

        varScreen.html(newContent);
    }

    fnSay = function(inputArray) {
        if(!inputArray[1]) {
            out.val(function(i, old) { return old+'\r\nMissing argument'})
            return;
        }

        if(inputArray[1] === '/?') {
            out.val(function(i, old) { return old+"\r\n? - SAY (print word/phrase)\r\nExamples:\r\n- say word\r\n- say \"long phrase with spaces\"" } )
            return;
        }

        if(inputArray[1].charAt(0) === "'" || inputArray[1].charAt(0) === '"') {
            inputArray[0] = "";
            let string = inputArray.join(" ");
            let matches = string.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
            if(!matches) {
                out.val(function(i, old) { return old+'\r\nFinal delimiter ("/\') not found, check string validity and retry'});
                return;
            }

            let match = matches[0].replace(/["']/g, "");
            out.val(function(i, old) { return old+"\r\n> "+match } )
        } else {
            //parola
            out.val(function(i, old) { return old+"\r\n> "+inputArray[1]})
        }
    }
    fnCls = function(inputArray) {
        out.val("<--> TERMINAL <-->");
    }
    fnExec = function(inputArray) {
        inputArray[0] = "";
        let string = inputArray.join(" ");

        try {
            out.val(function(i, old) { return old+"\r\n> "+eval(string) })
        } catch(e) {
            out.val(function(i, old) { return old+"\r\nError parsing the expression" })
        }
    }
    fnStore = function(inputArray) {
        if(!inputArray[1] || !inputArray[2]) {
            out.val(function(i, old) { return old+"\r\nError, STORE takes 2 arguments" })
            return;
        }

        if(inputArray[2].charAt(0) === "'" || inputArray[2].charAt(0) === '"') {
            inputArray[0] = "";
            let varName = inputArray[1];
            inputArray[1] = "";
            let string = inputArray.join(" ");
            let matches = string.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
            if(!matches) {
                out.val(function(i, old) { return old+'\r\nFinal delimiter ("/\') not found, check string validity and retry'});
                return;
            }

            let match = matches[0].replace(/["']/g, "");
            insertVariable(varName, match);
            refreshVariableList();
            out.val(function(i, old) { return old+"\r\n> Value '" + match + "' saved as [" + varName + "]" })
        } else {
            insertVariable(inputArray[1], inputArray[2]);
            refreshVariableList();
            out.val(function(i, old) { return old+"\r\n> Value '" + inputArray[2] + "' saved as [" + inputArray[1] + "]" })
        }
    }
    fnRemv = function(inputArray) {
        if(!inputArray[1]) {
            out.val(function(i, old) { return old+"\r\nError, REMV takes 1 arguments" })
            return; 
        }

        let success = removeVariable(inputArray[1]);
        refreshVariableList();
        if(success) {
            out.val(function(i, old) { return old+"\r\n> Variable " + inputArray[1] + " has been deleted!" })
        } else {
            out.val(function(i, old) { return old+"\r\nError, variable does not exist" })
        }
    }
    fnSetfg = function(inputArray) {
        if(inputArray[1]) {
            out.css('color', inputArray[1]); 
        } else {
            out.css('color', $("#colorTool").val());
        }
    }
    fnSetbg = function(inputArray) {
        if(inputArray[1]) {
            out.css('background-color', inputArray[1]);
        } else {
            out.css('background-color', $("#colorTool").val());
        }
    }
    fnHelp = function(inputArray) {
        let string = "\r\n\r\n-- HELP --\r\n";
        commands.forEach(el => {
            string += el.cmd + getPadding(el.cmd.length, 7) + ": " + el.desc + "\r\n"
        });
        string += "----------\r\n\r\n";
        out.val(function(i, old) {
            return old + string;
        })
    }

    var commands = [
        {
            cmd: "SAY",
            fn: fnSay,
            desc: "say word/phrase"
        },
        {
            cmd: "CLS",
            fn: fnCls,
            desc: "clear screen"
        },
        {
            cmd: "EXEC",
            fn: fnExec,
            desc: "execute command"
        },
        {
            cmd: "STORE",
            fn: fnStore,
            desc: "store variable"
        },
        {
            cmd: "REMV",
            fn: fnRemv,
            desc: "remove variable"
        },
        {
            cmd: "SETBG",
            fn: fnSetbg,
            desc: "set background color"
        },
        {
            cmd: "SETFG",
            fn: fnSetfg,
            desc: "set foreground color"
        },
        {
            cmd: "?",
            fn: fnHelp,
            desc: "help"
        }
    ]

    input.on( "keypress", function(event) {
        if(event.originalEvent.keyCode === 13) { //Se è invio
            sendUserInput();
        }
    });

    sendUserInput = function() {
        let inputString = input.val();
        input.val("");

        // Sostituisce $var_name$ con il valore della variabile se esiste, altrimenti NULL
        let matches = inputString.match(/\$\S+\$/g);
        console.log(matches);
        if(matches) {
            for(let i = 0; i < matches.length; i++) {
                let variableName = matches[i].replace(/\$/g, "");
                let variableValue = getVariable(variableName)?getVariable(variableName).value :"NULL";
                
                inputString = inputString.replace(matches[i], variableValue );
            }
        }
        //

        let inputArray = inputString.split(" ");
        let executed = false;

        for(let i = 0; i < commands.length; i++) {
            if(commands[i].cmd === inputArray[0].toUpperCase()) {
                commands[i].fn(inputArray);
                executed = true;
            }
        }

        if(!executed) {
            out.val(function(i, old) { return old + "\r\nCommand '"+inputArray[0]+"' not found (? for help)"});
        }
    }
});

