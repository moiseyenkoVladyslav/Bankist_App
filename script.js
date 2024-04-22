'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-05-09T14:43:26.374Z',
    '2023-05-10T18:49:59.371Z',
    '2023-05-12T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-06T10:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-05-14T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatCur = function(value,locale,currency){
  return new Intl.NumberFormat(locale, {style: `currency`, currency: currency}).format(value) ;
};

const formatMovementDate = function (nowDate,locale) {

  const calcDaysPassed = (date1,date2)=>Math.abs(date2 -date1)/(1000*60*60*24);
  const daysPassed = Math.trunc(calcDaysPassed(new Date(), nowDate));
  
  console.log(daysPassed);

  if(daysPassed === 0){
    return `Today`;
  }
  if(daysPassed === 1){
    return `Yesterday`;
  }
  if(daysPassed <= 7){
    return `${daysPassed} days ago`;
  }
  else{
    // const nowDay = `${nowDate.getDate()}`;
    // const nowMonth = `${nowDate.getMonth() + 1}`.padStart(2,0);
    // const nowYear = nowDate.getFullYear();
    
    // return `${nowDay}/${nowMonth}/${nowYear}`;
    return new Intl.DateTimeFormat(locale).format(nowDate);

  }

 
  
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    
    const nowDate = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(nowDate, acc.locale);

    const formatedMovement = formatCur(mov, acc.local, acc.currency);
    
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {

  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.local, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.local, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.local, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};


const startLogOutTimer = function(){
  //Set time to 5min
  let time = 20;
  const tick = function(){
    const min = String(Math.trunc(time / 60)).padStart(2, `0`);
    const sec = String(time % 60).padStart(2, `0`);
    //in each call -> print time to UI
    labelTimer.textContent = `${min}:${sec}`;
   

    //When 0 sec., stop timer and logout 
    if(time === 0){
      clearInterval(timer);

      labelWelcome.textContent = `Please Log in`;
      containerApp.style.opacity = 0;
    }
    //Decrease 1sec
    time--;
  }
  tick();
  const timer = setInterval(tick,
    //Call the timer every sec
    1000);
  

   //Returning timer to GLOBAL variable to prevent running of several timers at the same time
   return timer;
};

///////////////////////////////////////
// Event handlers




let currentAccount,timer;

// //FAKE LOGGED IN 
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;



// day/month/year


//Experementing with API 


btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create curent date 
   
    // const nowDay = `${nowTime.getDay()}`.padStart(2,`0`);
    // const nowMonth = `${nowTime.getMonth() + 1}`.padStart(2,`0`);
    // const nowYear = nowTime.getFullYear();
    // const nowHour = nowTime.getHours();
    // const nowMinets = nowTime.getMinutes();
    // // labelDate.textContent = nowTime;
    // labelDate.textContent = `${nowDay}/${nowMonth}/${nowYear}, ${nowHour}:${nowMinets}`;
    const nowTime = new Date();
const options = {
  hour:`numeric`,
  minute: `numeric`,
  day: `numeric`,
  month: `numeric`,
  year: `numeric`,
  // timeZoneName: `long`,
  // weekday: `long`
};
const local = navigator.language;


labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale,options).format(nowTime); 

  
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();


    //Timer 
    if(timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //reset Tiemr
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function(){  // Add movement
    currentAccount.movements.push(amount);

    //Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);}, 2000)

     //reset Tiemr
     clearInterval(timer);
     timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
console.log(23 === 23.000);
// Problem of Darstellung of Numbers in binary System
console.log(0.1 + 0.2 === 0.3);


// Convert String to Number
console.log(Number(`23`));
console.log(`23`);

// Parsing
console.log(Number.parseInt(`23px`,10));
console.log(Number.parseFloat(`2.5rem`,10));

//Check if a value is a real/finite Number 
console.log(Number.isFinite(23));
console.log(Number.isFinite(`23`));

//
console.log(Math.sqrt(25));
console.log(25 ** (1/2));
console.log(8 ** (1/3));

console.log(Math.max(0.4,0.3,0.2,0.9 ));
console.log(Math.max(22,`23`));

console.log(Math.min(`23px`,25));

console.log(Math.PI * Number.parseFloat(`10px`) ** 2 );

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = function(min, max){
 return  Math.floor(Math.random() * (max - min) + 1)+min;
}
console.log(randomInt(10,20));

// Rounding Integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

// Rounding Floats
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.725).toFixed(3));
console.log(+(2.725).toFixed(2));

// The Reminder Operator
console.log(5 % 2);
const isEven = n => n % 2 === 0;
console.log(isEven(3));
*/
labelBalance.addEventListener(`click`, function () {
  [...document.querySelectorAll(`.movements__row`)].forEach(function(row,i){
    if(i % 2 === 0){
      row.style.backgroundColor = `orange`;
    }
    if(i % 3 === 0) {
      row.style.backgroundColor = `grey`;
    }
  });
});
/*
//Numeric Separators

const diameterEarth = 287_460_000_000;

console.log(diameterEarth);

const priceCents = 375_69;
console.log(priceCents);

const transferFe1 = 15_00;
const transferFe2 = 1_500; // Different meaning, but same Number. 

console.log(Number(`254`));
console.log(Number(`25_4`));

//BigInt

console.log(2**53 -1);

//Operations

console.log(10000n + 10n);
const huge = 23n;
const small = 2;
// console.log(huge * small); // no way 

//Math
// console.log(Math.sqrt(16n)); //no way

//Divisions
console.log(10 / 3);
console.log(`BigInt Operations`, 10n / 3n);

//Creation of Dates
const now = new Date();
console.log(now);
console.log(new Date(account1.movementsDates[0]));

console.log(account1);

console.log(new Date(0)); // milisekond !
console.log(new Date(3 * 24*60*60*1000)); // counting 3 days after 0


//Working with Dates
const future = new Date(2037,10,19,15,35);
console.log(future);
console.log(future.getFullYear());
console.log(future.getDate());
console.log(future.toISOString());

console.log(new Date(future.getTime()));
console.log(Date.now());

future.setFullYear(2040);
console.log(future);

console.log(+future);
const calcDaysPassed = (date1,date2)=>Math.abs(date2 -date1)/(1000*60*60*24);

const days1 = calcDaysPassed(new Date(2037,3,14), new Date(2037,3,24));
console.log(days1);


//Internatinalizing Numbers 
const num = 3884764.23;

const options = {
  style: `currency`,
  unit: `celsius`,
  currency: `EUR`
};

console.log(`US :`, new Intl.NumberFormat(`en-US`, options).format(num));
console.log(`DE :`, new Intl.NumberFormat(`de-DE`, options).format(num));
console.log(`SY :`, new Intl.NumberFormat(`ar-SY`, options).format(num));
console.log(`${navigator.language} :`, new Intl.NumberFormat(navigator.language, options).format(num));


//Timers

//setInterval
const ingredients = [`olives`,`salami`,`spinach`];
const pizzaTimer = setTimeout((ing1,ing2) => console.log(`Here is your Pizza 🍕 with ${ing1} and ${ing2}`), 3000,...ingredients);
console.log(`waiting ...`);

if (ingredients.includes(`olives`)) {
  clearInterval(pizzaTimer);
  
}
//setTimeout
setInterval( function(){ 
const now = new Date();
console.log(now);
},1000
)

*/

//Timer/clock app
setInterval(
    function(){
      const nowTime = new Date();
      const format = {
        year : `numeric`,
        month: `long`,
        day: `numeric`,

        hour: `numeric`,
        minute: `numeric`,
        second : `numeric`
      };
      const now = new Intl.DateTimeFormat(navigator.language,format).format(nowTime);

      console.log(now); 
    },2000
  
);