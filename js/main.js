(function() {

    'use strict';

    var ENTER_KEY = 13;
    var txtName = document.getElementById('txtName');
    var txtLimit = document.getElementById('txtLimit');
    var txtBalance = document.getElementById('txtBalance');
    var txtPayment = document.getElementById('txtPayment');
    var txtInterestRate = document.getElementById('txtInterestRate');
    var txtNote = document.getElementById('txtNote');
    var chkPaidThisMonth = document.getElementById('chkPaidThisMonth');

    var addButton = document.getElementById('add');
    var syncDom = document.getElementById('sync-wrapper');

    var db = new PouchDB('MoneyPouch');
    var remoteCouch = 'http://glasses.iriscouch.com/MoneyPouch';

    db.info(function(err, info) {
        db.changes({
            since: info.update_seq,
            live: true
        }).on('change', showMoneyPouchItems);
    });

    // We have to create a new MoneyPouch document and enter it in the database
    function addMoneyPouchItem(name, type, limit, balance, payment, interest, note, paidThisMonth, date, time) {
        var MoneyPouch = {
            _id: new Date().toISOString(),
            name: name,
            type: type,
            limit: limit,
            balance: balance,
            payment: payment,
            interest: interest,
            note: note,
            paidThisMonth: paidThisMonth,
            date: date,
            time: time,
        };
        console.log(MoneyPouch);
        db.put(MoneyPouch).then(function(result) {
            console.log("everything is A-OK");
            console.log(result);
        }).catch(function(err) {
            console.log("everything is terrible");
            console.log(err);
        });
    }

    // Show the current list of MoneyPouchs by reading them from the database
    function showMoneyPouchItems() {
        db.allDocs({
            include_docs: true,
            descending: true
        }).then(function(doc) {
            redrawMoneyPouchUI(doc.rows);
        }).catch(function(err) {
            console.log(err);
        });
    }

    // User pressed the delete button for a MoneyPouch, delete it
    function deleteButtonPressed(MoneyPouch) {
        var answer = confirm("Are you sure you want to perminantley delete this record?")
        if (answer) {
            db.remove(MoneyPouch);
        } else {

        }
    }

    // The input box when editing a MoneyPouch has blurred, we should save
    // the new amount or delete the MoneyPouch if the amount is empty
    function MoneyPouchBlurred(MoneyPouch, event) {
        var trimmedText = event.target.value.trim();
        if (!trimmedText) {
            db.remove(MoneyPouch);
        } else {
            MoneyPouch.amount = trimmedText;
            db.put(MoneyPouch);
        }
    }
    // Initialise a sync with the remote server
    function sync() {
        syncDom.setAttribute('data-sync-state', 'syncing');
        var opts = {
            live: true
        };
        db.sync(remoteCouch, opts, syncError);
    }

    // EDITING STARTS HERE (you dont need to edit anything below this line)

    // There was some form or error syncing
    function syncError() {
        syncDom.setAttribute('data-sync-state', 'error');
    }

    // User has double clicked a MoneyPouch, display an input so they can edit the amount
    function MoneyPouchDblClicked(MoneyPouch) {
        var div = document.getElementById('li_' + MoneyPouch._id);
        var inputEditMoneyPouch = document.getElementById('input_' + MoneyPouch._id);
        div.className = 'editing';
        inputEditMoneyPouch.focus();
    }

    // If they press enter while editing an entry, blur it to trigger save
    // (or delete)
    function MoneyPouchKeyPressed(MoneyPouch, event) {
        if (event.keyCode === ENTER_KEY) {
            var inputEditMoneyPouch = document.getElementById('input_' + MoneyPouch._id);
            inputEditMoneyPouch.blur();
        }
    }



    // Given an object representing a MoneyPouch, this will create a list item
    // to display it.
    function createMoneyPouchListItem(MoneyPouch) {



        var name = document.createElement('span');
        name.appendChild(document.createTextNode(MoneyPouch.name));
        name.className = 'name';

        var type = document.createElement('span');
        type.appendChild(document.createTextNode(MoneyPouch.type));
        type.className = 'type';

        var limit = document.createElement('span');
        limit.appendChild(document.createTextNode("Limit: " + MoneyPouch.limit));
        limit.className = 'limit';

        var balance = document.createElement('span');
        balance.appendChild(document.createTextNode("Balance: " + MoneyPouch.balance));
        balance.className = 'balance';

        var payment = document.createElement('span');
        payment.appendChild(document.createTextNode("Payment: " + MoneyPouch.payment));
        payment.className = 'payment';

        var interest = document.createElement('span');
        interest.appendChild(document.createTextNode("APR: " + MoneyPouch.interest));
        interest.className = 'interest';

        var note = document.createElement('span');
        note.appendChild(document.createTextNode("Notes: " + MoneyPouch.note));
        note.className = 'note';


        var paidThisMonth = document.createElement('span');
        paidThisMonth.appendChild(document.createTextNode("Paid: " + MoneyPouch.paidThisMonth));
        paidThisMonth.className = 'paidThisMonth';


        var deleteLink = document.createElement('button');
        deleteLink.className = 'remove';
        deleteLink.appendChild(document.createTextNode("x"));
        deleteLink.addEventListener('click', deleteButtonPressed.bind(this, MoneyPouch));
        name.appendChild(deleteLink);


        // var inputEditMoneyPouch = document.createElement('input');
        // inputEditMoneyPouch.id = 'input_' + MoneyPouch._id;
        // inputEditMoneyPouch.className = 'edit';
        // inputEditMoneyPouch.value = MoneyPouch.amount;
        // inputEditMoneyPouch.addEventListener('keypress', MoneyPouchKeyPressed.bind(this, MoneyPouch));
        // inputEditMoneyPouch.addEventListener('blur', MoneyPouchBlurred.bind(this, MoneyPouch));

        var li = document.createElement('li');
        li.className = 'col1-3';
        li.id = 'li_' + MoneyPouch._id;
        var module = document.createElement('div');
        module.className = 'module';
        module.appendChild(name);
        module.appendChild(type);
        module.appendChild(limit);
        module.appendChild(balance);
        module.appendChild(payment);
        module.appendChild(interest);
        module.appendChild(note);
        module.appendChild(paidThisMonth);
        li.appendChild(module);

        return li;
    }

    function redrawMoneyPouchUI(MoneyPouchs) {
        var ul = document.getElementById('MoneyPouch-list');
        ul.innerHTML = '';
        MoneyPouchs.forEach(function(MoneyPouch) {
            ul.appendChild(createMoneyPouchListItem(MoneyPouch.doc));
        });
    }


    addButton.onclick = function() {
        console.log(txtName.value);
        console.log(getSelectedEntityType());
        console.log(toMoney(txtLimit.value));
        console.log(toMoney(txtBalance.value));
        console.log(toMoney(txtPayment.value));
        console.log(txtInterestRate.value);
        console.log(txtNote.value);
        console.log(chkPaidThisMonth.checked);
        console.log(createDate());
        console.log(createTime());
        addMoneyPouchItem(
            txtName.value,
            getSelectedEntityType(),
            toMoney(txtLimit.value),
            toMoney(txtBalance.value),
            toMoney(txtPayment.value),
            txtInterestRate.value,
            txtNote.value,
            chkPaidThisMonth.checked,
            createDate(),
            createTime()
        );
        txtName.value = '';
        txtLimit.value = '';
        txtBalance.value = '';
        txtPayment.value = '';
        txtInterestRate.value = '';
        txtNote.value = '';
        chkPaidThisMonth.checked = false;
    }

    showMoneyPouchItems();

    if (remoteCouch) {
        sync();
    }



    $(document).ready(function() {

        $('#showForm').click(function() {
            $('#showForm').hide();
            $('#addEntity').slideDown();
        });

        $('#hideForm').click(function() {
            $('#showForm').show();
            $('#addEntity').slideUp();
        });

        $('#entityTypeSelect').change(function() {
            showRelevantFormItem(getSelectedEntityType());
        });

        function showRelevantFormItem(className) {
            $('.formItem').hide();
            $('.formItem.' + className.toLowerCase()).show();
        }

        $(document).on("mousedown touchstart", ".type div", function() {
            deactivateAllCategories();
            activateCategory(this);
        });

        $('input[type="text"]').click(function() {
            $(this).select();
        });

        $('*[data-mask="money"]').each(function() {
            var value = $(this).val().replace("$", "").replace(",", "");
            if (isNaN(value) || value == "") {
                value = "0.00";
            }
            value = toMoney(value);
            $(this).val(value);
        });

        $("*[data-mask='money']").click(function() {
            $(this).select();
        });

        $('*[data-mask="money"]').focus(function() {}).blur(function() {
            var value = $(this).val().replace("$", "").replace(",", "");
            value = toMoney(value);
            $(this).val(value);
        });

    });

    /*
     * Returns string of text of the current selected category name.
     */
    function getSelectedEntityType() {
        return document.getElementById('entityTypeSelect').value;
    }

    function deactivateAllCategories() {
        $(".type .active").removeClass("active");
    }

    function activateCategory(element) {
        $(element).addClass("active");
    }

    function addCommas(str) {
        str += '';
        var x = str.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function toMoney(value) {
        var value = value.replace(/[^0-9.-]/g, "");
        var valueLength = value.length - 1;
        if (value.indexOf(".") !== -1) {
            if (value.substring(value.indexOf("."), valueLength).length == 0) {
                value = "$" + value + "00";
                return addCommas(value);
            }
            if (value.substring(value.indexOf("."), valueLength).length == 1) {
                value = "$" + value + "0";
                return addCommas(value);
            }
            if (value.substring(value.indexOf("."), valueLength).length == 2) {
                value = "$" + value;
                return addCommas(value);
            } else {
                var value = value.replace(/[^0-9.-]/g, "");
                value = preciseRound(value);
                value = "$" + value.toString();
                return addCommas(value);
            }
        } else {
            value = "$" + value + ".00";
            return addCommas(value);
        }
    }

    function preciseRound(num, decimals) {
        var rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        return rounded;
    }


    function createDate() {
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        return curr_date + "." + curr_month + "." + curr_year;
    }

    function createTime() {
        var d = new Date();
        return d.getHours() + ":" + d.getMinutes();;
    }


})();