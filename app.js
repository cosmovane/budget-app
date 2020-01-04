var budgetController = (function () {
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome>0){
      this.percentage = Math.round((this.value / totalIncome)*100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;

    data.allItems[type].forEach(function(current, index, array){
      sum += current.value;
    });

    data.totals[type] =  sum;
  };

  var data = {
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
  };

  return {
    addItem: function(type, des, val){
      var newItem;
      if(data.allItems[type].length>0){
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }

      if(type === 'exp'){
        newItem = new Expense(id, des, val);
      } else if(type === 'inc'){
        newItem = new Income(id, des,val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;

      ids = data.allItems[type].map(function(current, iteration, array){
        return current.id;
      }); //difference between map and foreach is that map returns an array

      index = ids.indexOf(id);
      if(index!==-1){
        data.allItems[type].splice(index, 1) //splice(position, # of elements), splice is to quit an element

      }
    },

    calculateBudget: function(){
      calculateTotal('exp');
      calculateTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;
      if(data.totals.inc>0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(current){
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(current){
        return current.getPercentage();
      }); //Array with all of the percentages
      return allPerc;
    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function(){
      console.log(data);
    }
  };

})();

var uiController = (function () {
  var domStrings = {
    inputType: '.add__type',
    inputDescription: 'add__description',
    inputValue: 'add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabeL: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec, type;
    num = Math.abs(num);
    num = num.toFixed(2); //Method of the number prototype. They have methods even if they are primitive types
    numSplit =  num.split('.');

    int = numSplit[0];
    if(int.length>3){
      int = int.substr(0,int.length - 3)+','+int.substr(int.length-3,int.length);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback){
    for(var i = 0; i<list.length; i++){
      callback(list[i],i);
    }
  };

  return{
    getInput: function(){
      return {
        type: document.querySelector(domStrings.inputType).value, // Will be eiather inc o exp
        description: document.getElementById(domStrings.inputDescription).value,
        value: parseFloat(document.getElementById(domStrings.inputValue).value),
      };
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      if(type === 'inc'){
        element = domStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%">'+ //%id%
        '<div class="item__description"> %description% </div>'+
        '<div class="right clearfix">'+
        '<div class="item__value"> %value% </div>'+
        '<div class="item__delete">'+
        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
        '</div> </div> </div>';
      } else if(type === 'exp'){
        element = domStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%">'+
        '<div class="item__description"> %description% </div>'+
        '<div class="right clearfix">'+
        '<div class="item__value"> %value% </div>'+
        '<div class="item__percentage">21%</div>'+
        '<div class="item__delete">'+
        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
        '</div> </div> </div>';
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId){
      var el;
      el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function(){
      var fields, fieldsArr;

      fields = document.querySelectorAll( '.add__description, .add__value');

      fieldsArr = Array.prototype.slice.call(fields); //slice is used to create a copy of the element

      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj){
      var type;
      obj.budget >= 0 ? type = 'inc' : type = 'exp';
      document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(domStrings.incomeLabeL).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if(obj.percentage>0){
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages){
      var fields = document.querySelectorAll(domStrings.expensesPercLabel);


      nodeListForEach(fields, function(current, index){
        if(percentages[index]>0){
          current.textContent = percentages[index]+'%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function(){
      var now, year, month, months;

      now = new Date();
      // var christmas = new Date(2019,11,25);
      months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(domStrings.dateLabel).textContent=months[month]+' '+year;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        domStrings.inputType + ',' +
        domStrings.inputDescription + ',' +
        domStrings.inputValue);

        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });

        document.querySelector(domStrings.inputBtn).classList.toggle('red');
    },

    getDomStrings: function(){
      return domStrings;
    }
  };

})();

var controller = (function (budgetCtrl, uiCtrl) {
  var setupEventListener = function(){
    var dom = uiCtrl.getDomStrings();

    document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event){
      if (event.keyCode===13 || event.which===13) {
        ctrlAddItem();
      }
    });

    document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
  };



  var updateBudget = function(){
    budgetCtrl.calculateBudget();
    var budget = budgetCtrl.getBudget();
    uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    uiCtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){
    var input, newItem;
    input = uiCtrl.getInput();
    if(input.description !== "" && !isNaN(input.value) && input.value>0){
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      uiCtrl.addListItem(newItem, input.type);
      uiCtrl.clearFields();
      updateBudget();
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, id);
      uiCtrl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  return{
    init: function(){
      console.log('Application has started');
      uiCtrl.displayMonth();
      uiCtrl.displayBudget({
        budget:0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListener();
    }
  }
})(budgetController, uiController);

controller.init();
