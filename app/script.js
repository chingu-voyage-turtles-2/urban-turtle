"use strict";

var time = {
    firstTimeDraw: true,
    AMPMToggled: false,
    setTime: function() {
        this.hours = new Date().getHours();
        this.minutes = new Date().getMinutes();
        this.seconds = new Date().getSeconds();
        this.setTimeOfDay(); //Morning, etc.
        setAMPM.call(this);
        addMissingZero.call(this, this.hours);
        addMissingZero.call(this, this.minutes);
        if (this.firstTimeDraw) {
            $("#mid-main-time-draw").html(
                "<p>" + time.hours + ":" + time.minutes + "<p>"
            );
            user.drawGreeting();
            focus.drawFocus();
            this.firstTimeDraw = false;
        } else {
            $("#mid-main-time-draw").html(
                "<p>" + time.hours + ":" + time.minutes + "<p>"
            );
        }
        // Update background image every day
        this.date = new Date().getDate();
        if (this.date != localStorage.getItem("imageDate")) {
            backgroundImage.updateImage = true;
            localStorage.setItem("imageDate", this.date);
        } else {
            backgroundImage.updateImage = false;
        }
        // Update quote every hour
        if (this.hours != localStorage.getItem("quoteHour")) {
            quote.updateQuote = true;
            localStorage.setItem("quoteHour", this.hours);
        } else {
            quote.updateQuote = false;
        }
        function setAMPM() {
            if (this.hours >= 12) {
                this.hours -= 12;
                this.AMPM = "PM";
            } else {
                this.AMPM = "AM";
            }
        }
        function addMissingZero(unit) {
            if (String(unit).length === 1) {
                switch(unit) {
                    case(this.hours): //Assigning unit doesn't work
                        this.hours = "0" + unit;
                        break;
                    case(this.minutes):
                        this.minutes = "0" + unit;
                }
            }
        }
    },
    updateTime: function() {
        setTimeout(function updateTimeTimeout() {
            time.setTime();
            time.updateTime();
        }, (60 - this.seconds) * 1000 + 1) //+1 to secure catching the updated time
    },
    setTimeOfDay: function() {
        switch(this.hours) {
            case(4): case(5): case(6): case(7): case(8): case(9): case(10):
                this.timeOfDay = "Morning"; //4 - 10
                break;
            case(11): case(12): case(13):
                this.timeOfDay = "Noon"; //11 - 13
                break;
            case(14): case(15): case(16): case(17):
                this.timeOfDay = "Afternoon"; //14 - 17
                break;
            case(18): case(19): case(20): case(21): case(22):
                this.timeOfDay = "Evening"; //18 - 22
                break;
            case(23): case(24): case(1): case(2): case(3):
                this.timeOfDay = "Night"; //23 - 3
                break;
            default: //To avoid defaulting to undefined
                this.timeOfDay = "Day";
        }
    }
}

let user = {
    name: localStorage.getItem("username"),
    drawGreeting: function() {
        if (user.name == null) {
            user.name = "User"
            $("#mid-main-username").html(`
                <form id="mid-main-username-form">
                    <input type="text" name="username" id="mid-main-username-input" placeholder="Enter Username">
                </form>`);
        } else {
            $("#mid-main-username").html("");
        }
        let greetings = {
            phrasesArray: [],
            phrases: {
                standard: {
                    phrase: "Good " + time.timeOfDay + ", <span id='editname' contenteditable>" + user.name + "</span>!",
                    chance: 70
                }, variation1: {
                    phrase: "Welcome back, <span id='editname' contenteditable>" + user.name + "</span>!",
                    chance: 15
                }, variation2: {
                    phrase: "Good to see you this " + time.timeOfDay + "!",
                    chance: 10
                }, variation3: {
                    phrase: "How's it going <span id='editname' contenteditable>" + user.name + "</span>?",
                    chance: 5
                }
            }
        }
        $("#mid-main-greeting").html(returnRandomPhrase(greetings.phrases, greetings.phrasesArray));
        user.getName();
        user.editName();
    },
    getName: function() {
        $("#mid-main-username-form").on('submit', function(e) {
            e.preventDefault();
            localStorage.removeItem("username");
            if (!localStorage.getItem("username")) {
                localStorage.setItem("username", $("#mid-main-username-input").val());
                user.name = localStorage.getItem("username");
            };
            user.drawGreeting();
            focus.drawFocus();
        });
    },
    editName: function() {
        $("#editname").keypress(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                localStorage.removeItem("username");
                if (!localStorage.getItem("username")) {
                    localStorage.setItem("username", $("#editname").text());
                    user.name = localStorage.getItem("username");
                };
                user.drawGreeting();
            }
        });
    }
}

var backgroundImage = {
    url: "https://cors-anywhere.herokuapp.com/" + "https://api.unsplash.com//photos/random?client_id=3e66d58c720b2e9697e94445cb461e9032b946068102f18f4f3203783b412e70&collections=140375&orientation=landscape",
    setImage: function(json = null) {
        if (json === null) {
            setImageCssLocationOwner(
                localStorage.getItem("imageUrl"),
                localStorage.getItem("imageLocation"),
                localStorage.getItem("imageUser")
            );
        } else {
            if (json.location == undefined) {
                setImageCssLocationOwner(
                    json.urls.full,
                    "Unknown",
                    json.user.name
                );
            } else {
                setImageCssLocationOwner(
                    json.urls.full,
                    json.location.name + ", " + json.location.country,
                    json.user.name
                );
            }
        }
        function setImageCssLocationOwner(url, location, owner) {
            $("body").css("background-image", "url(" + url + ")");
            $("#left-settings-location").text(location);
            $("#left-settings-owner").text("By: " + owner);
        }
    },
    getImage: function() {
        $.getJSON(this.url, function(json) {
            if (json.location == undefined) {
                localStorage.setItem("imageLocation", "Unknown");
            } else {
                localStorage.setItem("imageLocation", json.location.name + ", " + json.location.country);
            }
            localStorage.setItem("imageUrl", json.urls.full);
            localStorage.setItem("imageUser", json.user.name);
            backgroundImage.setImage(json);
        });
    },
    setupImage: function() {
        if (this.updateImage) {
            this.getImage();
        } else {
            this.setImage(null);
        }
    }
}

let quote = {
    url: "https://cors-anywhere.herokuapp.com/" + "https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json",
    author: "",
    quote: "",
    setQuote: function(json) {
        if (json === null) {
            drawQuote(
                localStorage.getItem("quote"),
                localStorage.getItem("quoteAuthor")
            );
        } else {
            if (json.quoteAuthor.length === 0) {
                drawQuote(
                    json.quoteText,
                    "Unknown"
                );
            } else {
                drawQuote(
                    json.quoteText,
                    json.quoteAuthor
                );
            }
        }
        function drawQuote(quote, author) {
            $("#mid-quote-draw").html(`
                <p id="mid-quote-draw-quote">${quote}</p>
                <span id="mid-quote-draw-author">${"- " + author}</span>`);
            $("#mid-quote-draw").css("bottom", "20px");
        }
    },
    getQuote: function() {
        (function requestQuote() {
            $.getJSON(this.url, function(json) {
                if (json.quoteText > 140) { // Limiting the length of the quote
                    quote.getQuote();
                } else {
                    localStorage.setItem("quote", json.quoteText);
                    if (json.quoteAuthor.length === 0) {
                        localStorage.setItem("quoteAuthor", "Unknown");
                    } else {
                        localStorage.setItem("quoteAuthor", json.quoteAuthor);
                    }
                    quote.setQuote(json);
                }
            }).fail(function requestQuoteFailed() {
                quote.getQuote();
            });
        }).call(this);
    },
    setupQuote() {
        if (quote.updateQuote) {
            this.getQuote();
        } else {
            this.setQuote(null);
        }
    }
}

let focus = {
    task: localStorage.getItem("mid-main-focus"),
    drawFocus: function() {
        let focusChecked,
        placeholders = {
            placeholdersArray: [],
            phrases: {
                variation1: { phrase: "fixing bugs", chance: 1
                }, variation2: { phrase: "programming", chance: 3
                }, variation3: { phrase: "contribute to open source", chance: 1
                }, variation4: { phrase: "reviewing code", chance: 2
                }, variation5: { phrase: "pairprogramming", chance: 1
                }, variation6: { phrase: "brainstorming", chance: 2
                }
            }
        }
        if (localStorage.getItem("focusChecked") == "true") {
            focusChecked = true;
        } else {
            focusChecked = false;
        }
        if (localStorage.getItem("username") !== null) {
            if (focus.task == null || focus.task == '') {
                $("#mid-main-focus").html(`
                <form id="mid-main-focus-form">
                    <label>What is your main focus today?</label>
                <input type="text" name="focus" id="mid-main-focus-value" 
                    placeholder="Eg: ${returnRandomPhrase(placeholders.phrases, placeholders.placeholdersArray)}">
                </form>`);
            } else {
                if (focusChecked) {
                    drawHtml("<s>" + focus.task + "</s>", "plus");
                } else {
                    drawHtml(focus.task);
                }
            };

            if (focusChecked) {
                $("#mid-main-focus-check").css("background-color", "rgba(255,255,255,0.3)");
            } else {
                $("#mid-main-focus-check").css("background-color", "none");
            };

            function drawHtml(task, plusOrDelete = "delete") {
                $("#mid-main-focus").html(`
                <div id="mid-main-focus-wrapper">
                    <img id="mid-main-focus-check" src="img/focus-check.png" class="focus-icons"/>
                    <span id="editfocus" contenteditable>${task}</span>
                    <img id="mid-main-focus-deleteplus" src="img/focus-${plusOrDelete}.png" class="focus-icons"/>
                </div>`);
            }
        };
        $("#mid-main-focus-check").click(function(e) {
            if (localStorage.getItem("focusChecked") == "true") {
                localStorage.setItem("focusChecked", "false");
                focus.drawFocus();
            } else {
                localStorage.setItem("focusChecked", "true");
                focus.drawFocus();
            }
        });

        $('#mid-main-focus-deleteplus').click(function(e) {
            localStorage.removeItem("mid-main-focus");
            localStorage.setItem("focusChecked", "false");
            focus.task = '';
            focus.drawFocus();
        });

        $("#mid-main-focus-form").on("submit", function(e) {
            e.preventDefault();
            localStorage.removeItem("mid-main-focus");
            if (!localStorage.getItem("mid-main-focus")) {
                localStorage.setItem("mid-main-focus", $("#mid-main-focus-value").val());
                focus.task = localStorage.getItem("mid-main-focus");
            };
            focus.drawFocus();
        });

        $("#editfocus").keypress(function(e) {
            if (e.which === 13) {
                localStorage.removeItem("mid-main-focus");
                if (!localStorage.getItem("mid-main-focus")) {
                    localStorage.setItem("mid-main-focus", $("#editfocus").text());
                    focus.task = localStorage.getItem("mid-main-focus");
                };
                focus.drawFocus();
            }
        });
    }
}

var todo = {
    dropupActive: false,
    dropupListener: function() {
        document.getElementById("right-todo-icon").addEventListener("click",
        function triggerDropup() {
            if (!todo.dropupActive) {
                chrome.storage.local.get(function(storage) {
                    todo.drawDropup(storage);
                });
            } else {
                $("#right-todo-dropup").removeClass("unhideTodoDropup");
                $("#right-todo-dropup").addClass("hideTodoDropup");
                $("#right-todo-arrow").css("display", "none");

                $("#right-todo-dropup").html("");

                todo.dropupActive = false;
            }
        });
    },
    drawDropup: function(storage) {
        let dropupId = "right-todo-dropup",
            todos = storage.todos,
            lineBreakCounter = 0,
            noTodoMessage = false,
            windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        
        $("#right-todo-dropup").html("<div id='right-todo-dropup-todo'></div>");
        $("#" + dropupId).removeClass("hideTodoDropup");
        $("#" + dropupId).addClass("unhideTodoDropup");
        $("#right-todo-arrow").css("display", "block");

        if (todos.length === 0) {
            noTodoMessage = true;
        } else {
            for (let i = 0; i < todos.length; i++) {
                if (storage.checked[i]) {
                    writeTodo(todos[i], i, storage);
                } else {
                    writeTodo(todos[i], i);
                }
                addTodoListener(i);
                (function addCheckboxListener(i) {
                    $("#" + dropupId + "-checkbox-" + i + "[type=checkbox]").on("click", function() {
                        if ($("#" + dropupId + "-checkbox-" + i + ":checked").length === 1) {
                            chrome.storage.local.get(function(storage) {
                                storage.checked[i] = true;
                                chrome.storage.local.set(storage);
                                todo.drawDropup(storage, i);
                            });
                        } else {
                            chrome.storage.local.get(function(storage) {
                                storage.checked[i] = false;
                                chrome.storage.local.set(storage);
                                todo.drawDropup(storage, i);
                            });
                        }
                    });
                })(i);
            }
        }
        $("#right-todo-dropup").append(`
            <form id="${dropupId}-form">
                <input type="text" name="todo" id="${dropupId}-input" placeholder="Enter Todo">
            </form>
        `);

        if (todos.length * 21 + lineBreakCounter * 19.1 > windowHeight * 0.7 - 42) { //Scrollbar
            $("#" + dropupId).css("height", (windowHeight * 0.7 - 42) + "px");
            $("#" + dropupId + "-todo").css("overflow-y", "scroll");
            $("#" + dropupId + "-todo").css("overflow-x", "hidden");
        } else { // Dynamic Height
            $("#" + dropupId).css("height", (50 + todos.length * 21 + lineBreakCounter * 19.1) + "px");
            $("#" + dropupId + "-todo").css("overflow", "hidden");
            $("#" + dropupId + "-todo").css("height", "inherit");
        }
        if (noTodoMessage) {
            $("#right-todo-dropup-todo").append(`
            <div id="right-todo-dropup-todo-notodo">
                <img src="img/wave.png" class="emoji"/>
                <img src="img/smile.png" class="emoji"/>
                <p>Hey there ${user.name}!<br>You can add new todo's below:</p>
            </div>
            `);
            $("#" + dropupId).css("height", "170px");
        }

        todo.dropupActive = true;
        (function addTodoInputListener() {
            $("#right-todo-dropup-form").submit(function(e) {
                e.preventDefault();
                chrome.storage.local.get(function(storage) {
                    storage.todos.push($("#right-todo-dropup-input").val());
                    storage.checked.push(false);
                    todo.drawDropup(storage);
                    chrome.storage.local.set(storage); 
                });
            });
        })();

        function writeTodo(content, i) {
            let checked = "",
                contentFinal = breakupString(content, 20);
            if (arguments.length === 3) {
                if (arguments[2].checked[i]) {
                    checked = "checked";
                    contentFinal = "<s>" + contentFinal + "</s>"
                }
            }
            $("#right-todo-dropup-todo").append(`
                <div class="todo-wrappers">
                    <input id="${dropupId}-checkbox-${i}" type="checkbox" class="todo-checkboxes" ${checked}>
                    <p id="${dropupId}-todo-${i}" class="todos" contenteditable>
                        ${contentFinal}
                    </p>
                    <img src="img/todo-delete.png" id="${dropupId}-todo-${i}-delete" class="todo-delete">
                </div>
            `);
        }
        function breakupString(str, splitAt) {
            if (str.length > splitAt) {
                let howOften = Math.floor(str.length / splitAt),
                    res;
                for (var i of range(1, howOften + 1)) {
                    if (i === 1) {
                        res = str.slice(0, splitAt * i);
                    } else {
                        res += "<br><span>" + str.slice((splitAt * (i - 1)), splitAt * i) + "</span>";
                    }
                }
                lineBreakCounter += howOften;
                return res;
            } else {
                return str;
            }

            function range(minNum, maxNum) {
                minNum -= 2;
                return Array.from(new Array(maxNum - minNum - 1), (x,i) => i - minNum)
            } 
        }
        function addTodoListener(i) {
            document.getElementById(dropupId + "-todo-" + i + "-delete").addEventListener("click", function onDelete() {
                todo.removeTodo(i);
            });
            $("#" + dropupId + "-todo-" + i).keypress(function(e) {
                if (e.which === 13) {
                    chrome.storage.local.get(function(storage) {
                        storage.todos[i] = $("#" + dropupId + "-todo-" + i).text().trim();
                        console.log($("#" + dropupId + "-todo-" + i).text().trim())
                        todo.drawDropup(storage);
                        chrome.storage.local.set(storage); 
                    });
                }
            });
        }
    },
    removeTodo: function(i) {
        chrome.storage.local.get(function(storage) {
            storage.checked.splice(i, 1);
            storage.todos.splice(i, 1);
            todo.drawDropup(storage);
            chrome.storage.local.set(storage); 
        });
    }
}

chrome.storage.local.get("todos", items=>{
    if (items.todos === undefined){
         chrome.storage.local.set({ todos: [], checked: []});
    }
});

document.getElementById("mid-search-box");

document.getElementById("mid-search-icon").addEventListener("click", function() {
    if (searchBox.style.display == "block") {
        searchBox.style.display = "none";
    } else {
        searchBox.style.display = "block";
    }
});

var draw = {
    fadeIn: function(id, timeToOpaque = 1800) {
        $("#" + id).fadeOut(0);
        $("#" + id).fadeIn(timeToOpaque);
    },
    initalFadeIn: function() {
        for (let id of [
            "right",
            "left",
            "mid-main-greeting",
            "mid-main-username",
            "mid-main-focus",
            "mid-search"
        ]) {
            this.fadeIn(id);
        }
        this.fadeIn("mid-main-time-draw", 1500);
    }
}

$("document").ready(function() {
    time.setTime();
    time.updateTime();
    backgroundImage.setupImage();
    quote.setupQuote();
    todo.dropupListener();
    draw.initalFadeIn();

    document.getElementById("mid-main-time-draw").addEventListener("dblclick",
    function toogleTwelveHourDisplay() {
        if (time.AMPMToggled) { //Clear
            $(".mid-main-time-twelvehours").html("");
            time.AMPMToggled = false;
        } else { //Draw
            $(".mid-main-time-twelvehours").html(
                "<p>" + time.AMPM + "</p>"
            );
            time.AMPMToggled = true;
        }
    });

    $("#left-settings-info").hover(
    function hideOtherDivs() {
        hide("mid");
        hide("right");
        hide("left-logo");
        hide("right-todo");
        hide("mid-quote");

        function hide(id) {
            $("#" + id).addClass("hideDivs");
            $("#" + id).removeClass("unhideDivs");
            if (id === "mid-quote") {
                $("#" + id).css("transition-delay", "3.5s");
                $("#" + id).css("transition-duration", "0.75s");
                $("#" + id).css("transition-property", "all");
                $("#" + id).css("transition-timing-function", "linear");
            }
        }
    }, function unhideOtherDivs() {
        unhide("mid");
        unhide("right");
        unhide("left-logo");
        unhide("right-todo");
        unhide("mid-quote");

        function unhide(id) {
            $("#" + id).addClass("unhideDivs");
            $("#" + id).removeClass("hideDivs");
            if (id === "mid-quote") {
                $("#" + id).css("visibility", "visible");
                $("#" + id).css("transition-delay", "0.25s");
                $("#" + id).css("transition-duration", "0.75s");
                $("#" + id).css("transition-property", "all");
                $("#" + id).css("transition-timing-function", "linear");
            }
        }
    });
});

function returnRandomPhrase(phrasesObj, resArr) {
    //Bulding a array out of the phrases keys and picking a random one
    for (let i in phrasesObj) {
        for (let c = 0; c < phrasesObj[i].chance; c++) {
            resArr.push(i);
        }
    }
    let index = resArr[
        Math.round(Math.random() * (resArr.length - 1))
        ];
    return phrasesObj[index].phrase
};
