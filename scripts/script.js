'use strict'

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// JSBank APP

// Data
const account1 = {
    owner: 'Jack Everyman',
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2020-11-18T21:31:17.178Z',
        '2020-12-23T07:42:02.383Z',
        '2021-01-28T09:15:04.904Z',
        '2021-04-01T10:17:24.185Z',
        '2021-05-08T14:11:59.604Z',
        '2021-12-20T17:01:17.194Z',
        '2021-12-22T23:36:17.929Z',
        '2021-12-23T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
}

const account2 = {
    owner: 'Jill Doe',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2020-11-01T13:15:33.035Z',
        '2020-11-30T09:48:16.867Z',
        '2020-12-25T06:04:23.907Z',
        '2021-01-25T14:18:46.235Z',
        '2021-02-05T16:33:06.386Z',
        '2021-04-10T14:43:26.374Z',
        '2021-12-21T18:49:59.371Z',
        '2021-12-23T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
}

const accounts = [account1, account2]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')
const infobox = document.querySelector('#information')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')
const btnCloseInfo = document.querySelector('.btn--close-info')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

///////////////////////////////////////////////////////////////////////////
// FUNCTIONS

const formatMovementDate = (date, locale) => {
    const calcDaysPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

    const daysPassed = calcDaysPassed(new Date(), date)

    if (daysPassed === 0) {
        return 'Today'
    }
    if (daysPassed === 1) {
        return 'Yesterday'
    }
    if (daysPassed <= 7) {
        return `${daysPassed} days ago`
    } else {
        /*         const day = `${date.getDate()}`.padStart(2, 0)
                    const month = `${date.getMonth() + 1}`.padStart(2, 0)
                    const year = date.getFullYear()

                    return `${day}/${month}/${year}` */
        return new Intl.DateTimeFormat(locale).format(date)
    }
}

const formatCurrency = (value, locale, currency) => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value)
}

const displayMovements = (account, sort = false) => {
    containerMovements.innerHTML = ''

    const movs = sort
        ? account.movements.slice().sort((a, b) => a - b)
        : account.movements

    movs.forEach((movement, i) => {
        const type = movement > 0 ? 'deposit' : 'withdrawal'

        const date = new Date(account.movementsDates[i])
        const displayDate = formatMovementDate(date, account.locale)

        const formattedMovement = formatCurrency(
            movement,
            account.locale,
            account.currency
        )

        const html = /*html*/ `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1
            }. ${type}</div>
        <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMovement}</div>
        </div>
        `

        containerMovements.insertAdjacentHTML('afterbegin', html)
    })
}

const calcDisplayBalance = account => {
    account.balance = account.movements.reduce((acc, mov) => acc + mov, 0)

    labelBalance.textContent = formatCurrency(
        account.balance,
        account.locale,
        account.currency
    )
}

const calcDisplaySummary = account => {
    const incomes = account.movements
        .filter(mov => mov > 0)
        .reduce((acc, mov) => acc + mov, 0)

    labelSumIn.textContent = formatCurrency(
        incomes,
        account.locale,
        account.currency
    )

    const out = account.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0)

    labelSumOut.textContent = formatCurrency(Math.abs(out), account.locale, account.currency)

    const interest = account.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * account.interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0)

    labelSumInterest.textContent = formatCurrency(interest, account.locale, account.currency)
}

const createUsernames = accounts => {
    accounts.forEach(account => {
        account.username = account.owner
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('')
    })
}

createUsernames(accounts)

const updateUI = account => {
    // Display movements
    displayMovements(account)

    // Display balance
    calcDisplayBalance(account)

    // Display summary
    calcDisplaySummary(account)
}

// Event Handlers
btnCloseInfo.addEventListener('click', ev => {
    infobox.style.display = 'none'
})

let currentAccount

//FAKE ALWAYS LOGGED IN
currentAccount = account1
updateUI(currentAccount)
containerApp.style.opacity = 100

btnLogin.addEventListener('click', ev => {
    ev.preventDefault()
    currentAccount = accounts.find(
        acct => acct.username === inputLoginUsername.value
    )

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]
            }`
        containerApp.style.opacity = 100

        // Create current date and time
        const now = new Date()
        /* const day = `${now.getDate()}`.padStart(2, 0)
            const month = `${now.getMonth() + 1}`.padStart(2, 0)
            const year = now.getFullYear()
            const hour = `${now.getHours()}`.padStart(2, 0)
            const minutes = `${now.getMinutes()}`.padStart(2, 0) */
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            // weekday: 'long'
        }
        const locale = currentAccount.locale
        labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
            now
        )

        // Clear input fields
        inputLoginUsername.value = ''
        inputLoginPin.value = ''
        inputLoginPin.blur()

        // Update UI
        updateUI(currentAccount)
    }
})

btnTransfer.addEventListener('click', ev => {
    ev.preventDefault()
    const amount = Number(inputTransferAmount.value)
    const receivingAccount = accounts.find(
        acct => acct.username == inputTransferTo.value
    )

    inputTransferAmount.value = inputTransferTo.value = ''

    if (
        amount > 0 &&
        receivingAccount &&
        currentAccount.balance >= amount &&
        receivingAccount?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount)
        receivingAccount.movements.push(amount)

        //Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString())
        receivingAccount.movementsDates.push(new Date().toISOString())
        // Update UI
        updateUI(currentAccount)
    }
})

btnLoan.addEventListener('click', ev => {
    ev.preventDefault()
    const amount = Math.floor(inputLoanAmount.value)

    if (
        amount > 0 &&
        currentAccount.movements.some(movement => movement >= amount * 0.1)
    ) {
        // Add movement
        currentAccount.movements.push(amount)

        // Add loan date
        currentAccount.movementsDates.push(new Date().toISOString())

        // Update UI
        updateUI(currentAccount)
    }
    inputLoanAmount.value = ''
})

btnClose.addEventListener('click', ev => {
    ev.preventDefault()

    if (
        currentAccount.username === inputCloseUsername.value &&
        currentAccount.pin === Number(inputClosePin.value)
    ) {
        const index = accounts.findIndex(
            acct => acct.username === currentAccount.username
        )

        //Delete account
        accounts.splice(index, 1)

        //Hide UI
        containerApp.style.opacity = 0
    }
    inputCloseUsername.value = inputClosePin.value = ''
})

let sorted = false
btnSort.addEventListener('click', ev => {
    ev.preventDefault()
    displayMovements(currentAccount.movements, !sorted)
    sorted = !sorted
})

const currencies = new Map([
    ['USD', 'United States dollar'],
    ['EUR', 'Euro'],
    ['GBP', 'Pound sterling'],
])

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300]
