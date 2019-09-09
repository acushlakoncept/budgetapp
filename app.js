
// BUDGET CONTROLLER
let budgetController = (function(){

    //function constructor
    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome){

        if (totalIncome > 0) {
            
            this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(current =>{
            sum  += current.value;
        });

        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, desc, val){
            let newItem, ID;
            
            //create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
           
            // create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, desc, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id){
            let ids, index;
             
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);  // go through this again
            }
        },

        calculateBudget: function(){

            // calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(cur =>{
                cur.calculatePercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });

            return allPerc;  // go through this one again
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data)
        }
    }

}) ();


// UI CONTROLLER
let UIController = (function(){

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };

    let formatNumber = function(num, type){
        
        let numSplit, int, dec;
        // + or - before number
        // exactly 2 decimal points
        // comma separating the thousands

        num = Math.abs(num);
        num = num.toFixed(2);  // toFixed is a member of number prototype
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
           int =  int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];
        

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function(list, callback){
        for(let i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        getinput: function(){
            return {
                 type: document.querySelector(DOMStrings.inputType).value,   // will be either 'inc' or 'exp'
                 description: document.querySelector(DOMStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }            
        },

        addListItem: function(obj, type){
            let html, newHtml, element;
            // create HTML string with placeholder text
            if(type === 'inc'){
               element = DOMStrings.incomeContainer; 

            html = `
                    <div class="item clearfix" id="inc-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix">
                            <div class="item__value">%value%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>
                    `;
            }else if (type === 'exp'){
                element = DOMStrings.expenseContainer; 

                html = `
                    <div class="item clearfix" id="exp-%id%">
                    <div class="item__description">%description%</div>
                    <div class="right clearfix">
                        <div class="item__value">%value%</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                    </div>
                    `;}
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr = Array.from(fields);

            fieldsArr.forEach(field => {
                field.value = "";
            });

            // fieldsArr.forEach(function(current, index, array){
            //     current.value = "";
            // });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            
            let fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        

        displayMonth: function(){
            let now, year, month, months;
            
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function(){

            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    }

})();


// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

    let setupEventListeners = function(){
        let DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };    
        
    let updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();


        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    }

    let updatePercentages = function(){
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    let ctrlAddItem = function(){
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getinput();
             
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            // 6. Calculate and Update percentages
            updatePercentages();
        }
        

    };

    let ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID)

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update an show the new budget
            updateBudget();

            // 4. Calculate and Update percentages
            updatePercentages();

        }

    };

    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }
   

})(budgetController, UIController);

controller.init();