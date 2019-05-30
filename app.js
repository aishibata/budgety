// these functions are independent and has no relations because they are in IIFE

//////////////////////// BUDGET CONTROLLER //////////////////////////////////////

var budgetController = (function () {
    // create prototype obejects 
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // not defined = -1
    };
    
    // A prototype that calculates each expense amount / total income. 
    Expense.prototype.calcPercentage = function (totalIncome) {
        
        if (totalIncome > 0) {
             this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else {
            this.percentage = -1;
        }
    };
    // A prototype that returns the calculated percentage above. 
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
   }; 
    // this will calculate the sum of all the data, either expense or income 
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) { // cur = current element. value - the value that was just typed into the field.
            sum += cur.value;
        });
        // store the newly typed value to the totals in the data variable 
        data.totals[type] = sum; 
    };
    // data structure 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        //income - expense 
        budget: 0,
        percentage: -1 // -1 = used when we want to say non-existent. 
    };
    
    return { 
                // a method that adds items based on the type of value. 
                addItem: function (type, des, val) { // income or expense / description / value. we are using different names to avoid confusion
                    var newItem, ID;

                    if(data.allItems[type].length > 0) {
                        ID = data.allItems[type][data.allItems[type].length - 1].id + 1 // selecting the last item of array and creating the next unique ID 
                    } else {
                        ID = 0;
                    }
                    
                    if(type === 'exp') {
                        newItem = new Expense(ID, des, val);
                    } else if (type === 'inc') {
                        newItem = new Income(ID, des, val);
                    }

                    //push into our data structure
                    data.allItems[type].push(newItem); 
                    //return the new element
                    return newItem;

                }, 

                // the method to delete an item when the delete button is clicked, using Splice method

                deleteItem: function (type, id) {
                    var ids, index; 
                    //id = 3 // data.allItems[type][3] - this does not work when the id numbers left are not in order. [1 2 4 6 8] - it will delete 6. 

                    // solution is create an array with all the IDs that we have, and figure out what the input ID is. index = 3 

                    //ids = [1 2 4 6 8]

                    // map method. the difference between map and forEach method is that map method return the new array. 

                    var ids = data.allItems[type].map(function(current){
                        return current.id; 
                    }); 

                    index = ids.indexOf(id);

                    // we only want to remove the item when the index exists. 
                    // slice method - create a copy. splice - remove the element. 
                    if (index !== -1) {
                        data.allItems[type].splice(index, 1); // 1 - number of element that we want to remove. 
                    }
                },



                // create a public method in the budget controller to calculate the total expense and income. we put a public function here first and then create additional private function in Budget Controller, called calculateBudget. 
                calculateBudget: function () {
                        // calculate the total income and expenses
                        calculateTotal('exp');
                        calculateTotal('inc');

                        // calculate the budget : income - expenses. these data are stored in the data structure 
                        data.budget = data.totals.inc - data.totals.exp;

                        // calculate the % of income that we spent. we want to only calculate if the income value is positive, not 0. we cannot divide 0 / 900 etc. we will get infinity as a result. 

                        if (data.totals.inc > 0) {
                            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                        } else {
                            data.percentage = -1; // non-existence
                        }

                    },
        
                calculatePercentages: function () {
                    /* we need the total income amount, and each expense amount. also, we need a method that calculates the percentage EACH TIME an expense is entered. thus, we need to create a function prototype that is attached to the Expense function constructor. */
                    
                    data.allItems.exp.forEach(function(cur){ // callback function 
                        cur.calcPercentage(data.totals.inc);
                    });
                    
                    
                    },
                    // return an array - list of percentages calculated above.
                    getPercentages: function () {
                        var allPerc = data.allItems.exp.map(function(cur){
                            return cur.getPercentage();
                        });
                         return allPerc;
                    },
        
        
                // returning the budget that are calculated in calculateBudget function. 
                getBudget: function() {
                        return {
                            budget: data.budget,
                            totalInc: data.totals.inc,
                            totalExp: data.totals.exp,
                            percentage: data.percentage
                        }
                },
        
        

                testing: function () {
                        console.log(data);

                }
            }

})();
    

/////////////////////// UI CONTROLLER ///////////////////////////////////////////////////
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        
        // calculated values - labels 
        budgetLabel: '.budget__value', // calculated total value after total income - total expense 
        incomeLabel: '.budget__income--value', // total income
        expenseLabel: '.budget__expenses--value', // total expense
        percentageLabel: '.budget__expenses--percentage', // calculated percentage 
        
        container: '.container',
        
        expensesPercentageLabel: '.item__percentage',
        
        dateLabel: '.budget__title--month'
    };
    
    // private function, instead of public 
    var formatNumber = function(num, type){
            var numSplit, int, dec;
            
            num = Math.abs(num); // absolute numbers
            num = num.toFixed(2); // take care of decimal points to 2 decimal points. returns as a string
            
            numSplit = num.split('.');
            
            int = numSplit[0]; // integer, before . in a number
            
            if (int.length > 3) { // more than 1000
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 23510, output 23,510
            }
            
            dec = numSplit[1]; // decimal part
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
        };
    
         //nodelist - each element is called node. 
            
        var nodeListForEach = function(list, callback){
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
            };
        };
    
        return { // return makes the methods below bublic, thus accessible from the outer functions. 
                getInput: function () {
                    return {
                    type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: //parseFloat is a javascript built-in function that we can use to change string to number.
                    parseFloat(document.querySelector(DOMstrings.inputValue).value)
                    };

                },

                addListItem: function (obj, type) {    
                    var html, newHtml, element;

                    // Create HTML string with placeholder text       
                    if (type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                    } else if (type === 'exp') {
                    element = DOMstrings.expenseContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                    }
                    // replace the placeholder text with some actual data
                    newHtml = html.replace('%id%', obj.id);
                    newHtml = newHtml.replace('%description%', obj.description);
                    newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

                    // insert the HTML into the DOM / adjacent html method
                    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);       

                },

                deleteListItem: function (selectorID) { //  we want to pass the entire ID from the Global App Controller, itemID. we will name it as selectorID here. ex. expense-1

                    // remove child method. In javascript, we cannot just remove an element. we need to find out the parent node from the element that we are interested in, and then move down to the child element again. 
                   var element = document.getElementById(selectorID);
                   element.parentNode.removeChild(element);
        },
        
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //querySelectorAll returns values as list, so we need to convert it to array.
            fieldsArr = Array.prototype.slice.call(fields);
            
            //loop over the array that we just converted and clear the value
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            //bring the focus back to the description
            fieldsArr[0].focus();
            
            
        },
        
        displayBudget: function (obj) { // we need an object where all the data is stored. obj will call from getBudget method from the budgetController function. 
            var type; 
            
            obj.budget > 0 ? type = 'inc' : 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            //document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            
            // set up conditional so we avoid displaying -1, when the value of percentage is -1
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
            
        },
        
        // display each expense item's percentages.
        displayPercentages: function (percentages) { // need to receive percentage array 
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            // this is a callback function. this will be passed to the callback above. this happens 5 times if there are 5 expenses.
            nodeListForEach(fields, function (current /* list[i] */, index /* i */){ 
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            
            });
  
        },
            
            
        displayMonth: function () {
            var now, months, month, year;
            
            // function constructor called Date, to store the current date
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth();
            
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        
        },
            
        changedType: function () {
          var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
            
        //place + or - before each value, 
        // place 00 (two decimal points) after each value
        // comma separating the thousands
            // ex. 2310, 4567 => + 2,310.46
            // ex. 2000 => + 2,000.00
            
        
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
    
})();

////////////// GLOBAL APP CONTROLLER ////////////////////////////////////////////////

var controller = (function(budgetCtrl, UICtrl) {
    // the very initial function that sets up the event listeners before clicking the .add__btn
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) { // event.which is for older browsers
        ctrlAddItem();
        }
    });   
    
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);  
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType); 
    };
    
    
    // this function will be used both when we add, and delete an item. so this is very important that we create the function here so we can reuse it in the future. 
    
    var updateBudget = function() {
        //1. calculate the budget 
        budgetCtrl.calculateBudget();  
        
        //2. return the budget  
        var budget = budgetCtrl.getBudget();
        
        //3. display the budget on the UI
        console.log(budget);
        UICtrl.displayBudget(budget); // (budget) is the variable just declared above. it calls getBudget method and the four values within that method --- budget: data.budget, totalInc: data.totals.inc, totalExp: data.totals.exp, percentage: data.percentage
    };
    
    // similar to updatBudget function, we will create a new function to update the percentage of each item every time an item is added or deleted, both income and expense. 
    
    var updatePercentages = function () { // we do not need to pass an argument
        
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        
        // 2. read the percentage from the budgetController 
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI
        
        UICtrl.displayPercentages(percentages); // passing percentages variable above, which comes from the budget controller. 
        
    };
    
            // function that happens when we click the .add__btn. It will also call getInput, addItem, addListItem, and clearFields methods. 
            var ctrlAddItem = function () {
                var input, newItem;
                //1. get the field input data
                input = UICtrl.getInput();

                if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
                //2. add the item to the budet controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                //3. add the new item to the UI 
                UICtrl.addListItem(newItem, input.type);

                //4. clear the fields
                UICtrl.clearFields();

                //5. calculate and update budget
                updateBudget();
                    
                //6. calculate and update percentages of each item
                updatePercentages();
            
                }

            };

            var ctrlDeleteItem = function (event) { 
                var itemID, splitID, type, ID;
               // console.log(event.target);

                console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
                itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

                if (itemID) {
                    //  inc-1 we need to split inc and 1
                    splitID = itemID.split('-');
                    type = splitID[0];
                    ID = parseInt(splitID[1]); // parseInt converts string to number. 

                    // 1. delete the item
                    budgetCtrl.deleteItem(type, ID);

                    // 2. delete the item from UI. we want to pass the entire ID from the Global App Controller, itemID. we will named it as selectorID. when we pass the argument, we pass itemID here. 
                    UICtrl.deleteListItem(itemID); 

                    //3. update the new budget
                    updateBudget();
                    
                    //4. calculate and update percentages of each item
                    updatePercentages();
                }
    };
    
    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({ // set all values to display 0 
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }); 
            setupEventListeners();
            
        }
    }
    
})(budgetController, UIController);

controller.init();








