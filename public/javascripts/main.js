var idSala = O('sala-desc');
var capacidade = O('sala-capac');
var tipoSala = O('tipo-sala');
var fator1 = O("fator1");
var fator2 = O("fator2");
var fator3 = O("fator3");
var data_out = O("result-comb");
var toogle = O('advanced-options');
var btnO = O('btn-options');

document.addEventListener('DOMContentLoaded', function(){
    window.setTimeout(function() {
        document.getElementById(".alert").fadeTo(500, 0).slideUp(500, function(){
            document.getElementById(this).style.display = none; 
        });
    }, 2000);
}, false);

function O(msg) {
    return document.getElementById(msg);
}

/* function concatenar() {
    data_out.value = idSala.value + ' ' + capacidade.value + ' ' + tipoSala.value + ' ' + fator1.value + ' ' + fator2.value + ' ' + fator3.value;
}

function saveResult() {
    var blob = new Blob(data_out.value, {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "room_output.txt");
}
 */
function remove() {
    var el = document.getElementById('wrapper-turma');

    if (el.lastChild.nodeValue == 0) {
        console.log('Ultima div, nao remove');
    } else {
        el.lastChild.remove()
    }
}

/* function hideOptions() {
    if (toogle.style.display === "none") {
        toogle.style.display = "inline-block";
    } else {
        toogle.style.display = "none";
    }
} */

function createNewSchedule() {
    let div = document.getElementById('wrapper-turma');
    var initialoptions = ["HORA INICIAL", "07:30", "08:20", "09:10", "10:10", "11:00", "13:30", "14:20", "15:10", "16:20", "17:10", "18:30", "19:20", "20:20", "21:10"];
    var initialvalues = ["", "0730", "0820", "0910", "1010", "1100", "1330", "1420", "1510", "1620", "1710", "1830", "1920", "2020", "2110"];
    var daysoptions = ["DIA", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    var daysvalues = ["", "2", "3", "4", "5", "6", "7"];
    var classoptions = ["Escolha um tipo", "Mesas e Cadeiras", "Bancadas", "Laboratórios"];
    var classvalues = ["", "1", "2", "3"];
    var selectHour = document.createElement('select');
    var selectDays = document.createElement('select');
    var credit = document.createElement('input');
    var selectSala = document.createElement('select');

    //AS 4 DIV
    var diadiv = document.createElement('div');
    var horadiv = document.createElement('div');
    var creditdiv = document.createElement('div');
    var tipodiv = document.createElement('div');

    diadiv.className = horadiv.className = creditdiv.className = tipodiv.className = "form-group col-md-3";
    selectSala.name = 'salaTurma';
    selectSala.className = "form-control";
    selectSala.required = true;
    selectSala.placeholder = "Escolha um tipo";
    credit.type = 'number';
    credit.placeholder = "Ex: 4";
    credit.className = "form-control";
    credit.name = 'creditos';
    credit.required = true;
    selectDays.name = 'dia';
    selectDays.className = "form-control";
    selectDays.required = true;
    selectHour.name = 'startTimer';
    selectHour.className = "form-control";
    selectHour.required = true;

    diadiv.appendChild(selectDays);
    horadiv.appendChild(selectHour);
    creditdiv.appendChild(credit);
    tipodiv.appendChild(selectSala);

    div.appendChild(diadiv);
    div.appendChild(horadiv);
    div.appendChild(creditdiv);
    div.appendChild(tipodiv);

    //cria as opções de horários
    for (let i = 0; i < initialoptions.length; i++) {
        var option = document.createElement('option');
        if (i == 0) {
            option.selected = true;
            option.disabled = true;
            option.hidden = true;
            option.text = initialoptions[i];
            option.value = initialvalues[i];
        } else {
            option.text = initialoptions[i];
            option.value = initialvalues[i];
        }
        selectHour.appendChild(option);
    }
    //cria as opções de dias
    for (let i = 0; i < daysoptions.length; i++) {
        var option = document.createElement('option');
        if (i == 0) {
            option.selected = true;
            option.disabled = true;
            option.hidden = true;
            option.text = daysoptions[i];
            option.value = daysvalues[i];
        } else {
            option.text = daysoptions[i];
            option.value = daysvalues[i];
        }
        selectDays.appendChild(option);
    }
    for (let i = 0; i < classvalues.length; i++) {
        var option = document.createElement('option');
        if (i == 0) {
            option.selected = true;
            option.disabled = true;
            option.hidden = true;
            option.text = classoptions[i];
            option.value = classvalues[i];
        } else {
            option.text = classoptions[i];
            option.value = classvalues[i];
        }
        selectSala.appendChild(option);
    }
}