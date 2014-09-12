Money Pouch
=========


####Simple financial tool using PouchDB
MoneyPouch will be a Chrome Web App for you to track your bills and finances. MoneyPouch will have a companion mobile web app called MoneyPouchGo for tracking spending quickly and eisily on the go.  [See MoneyPouchGo Repo here](https://github.com/AlexBezuska/MoneyPouchGo)


---

####Planned Features

* create entities, entities can be accounts, credit line, loan, or bill
* add/edit properties of an entity
* drag to sort entities
* sort by any of the properties
* calculate remaining payments to payoff of loans and credit lines
* Data stored locally in PouchDB (indexedDB or webSQL depending on browser)
* Data sync with Money Pouch Go using CouchDB server

###Advanced/far future features
* Credit payment snowballing based on an algorythm that takes into account balance, and interest rate of all credit lines to provide an 'urgency rating'.
* data backup to .csv in the most usefull and common format


---
####Entity planned properties

#####Credit Line 
- _id, name, sortOrder, type, CreditLimit, balance, availableCredit, payoffMonths, currentPayment, interestRate, note, paidThisMonth

#####Loan 
- _id, name, sortOrder, type, Total, balance, payoffMonths, currentPayment, interestRate, note, paidThisMonth

#####Bill 
- _id, name, sortOrder, type, currentPayment, note, paidThisMonth

#####account
- _id, name, sortOrder, type, balance, note
