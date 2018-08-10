var idSala = O('sala-desc');
var capacidade = O('sala-capac');
var tipoSala = O('tipo-sala');
var fator1 = O("fator1");
var fator2 = O("fator2");
var fator3 = O("fator3");
var data_out = O("result-comb");
var toogle = O('advanced-options');
var btnO = O('btn-options');

function O(msg){
    return document.getElementById(msg);
}

function concatenar(){
    data_out.value = idSala.value + ' ' + capacidade.value + ' ' + tipoSala.value + ' ' + fator1.value + ' ' + fator2.value + ' ' + fator3.value;
}

function saveResult(){
    var blob = new Blob(data_out.value, {type: "text/plain;charset=utf-8"});
    saveAs(blob, "room_output.txt");
}

function createNewSchedule(){
    
    var div = document.getElementById('wrapper-turma');
    //div.innerHTML = 'TESTE';
    var initialoptions  = ["HORA INICIAL", "07:30", "08:20", "09:10", "10:10", "11:00", "13:30", "14:20", "15:10", "16:20", "17:10", "18:30", "19:20", "20:20", "21:10"];
    var initialvalues   = ["", "0730", "0820", "0910", "1010", "1100", "1330", "1420", "1510", "1620", "1710", "1830", "1920", "2020", "2110"];
    var daysoptions     = ["DIA", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    var daysvalues      = ["", "2", "3", "4", "5", "6", "7"];
    var classoptions    = ["TIPO SALA", "Mesas e Cadeiras", "Bancadas", "Laboratórios"];
    var classvalues     = ["", "1", "2", "3"];
    var selectHour      = document.createElement('select');
    var selectDays      = document.createElement('select');
    var credit          = document.createElement('input');
    var selectSala      = document.createElement('select');
    var timediv         = document.createElement('div');
    timediv.id          = 'time-container';
    selectSala.id       = 'tipo-sala-turma';
    selectSala.name     = 'salaTurma';
    selectSala.required = true;
    credit.id           = 'creditos';
    credit.type         = 'number';
    credit.name         = 'creditos'
    credit.required     = true;
    selectDays.id       = 'dia-timer';
    selectDays.name     = 'dia';
    selectDays.required = true;
    selectHour.id       = 'start-timer';
    selectHour.name     = 'startTimer';
    selectHour.required = true;
    timediv.appendChild(selectDays);    
    timediv.appendChild(selectHour);
    timediv.appendChild(credit);
    timediv.appendChild(selectSala);
    div.appendChild(timediv);
    
    //cria as opções de horários
    for(let i=0; i<initialoptions.length; i++){
        var option       = document.createElement('option');
        if(i == 0){ 
            option.selected     = true;
            option.disabled     = true;
            option.hidden       = true;
            option.text         = initialoptions[i];
            option.value        = initialvalues[i];
        }else{
            option.text      = initialoptions[i];
            option.value     = initialvalues[i];
        }
        selectHour.appendChild(option);
    }
    //cria as opções de dias
    for(let i=0; i<daysoptions.length; i++){
        var option      = document.createElement('option');
        if(i == 0){
            option.selected     = true;
            option.disabled     = true;
            option.hidden       = true;
            option.text         = daysoptions[i];
            option.value        = daysvalues[i];
        }else{
            option.text         = daysoptions[i];
            option.value        = daysvalues[i];
        }
        selectDays.appendChild(option);
    }
    for(let i=0; i<classvalues.length; i++){
        var option      = document.createElement('option');
        if(i == 0){
            option.selected     = true;
            option.disabled     = true;
            option.hidden       = true;
            option.text         = classoptions[i];
            option.value        = classvalues[i];
        }else{
            option.text     = classoptions[i];
            option.value    = classvalues[i];
        }
        selectSala.appendChild(option);
    }
}

function remove(){
    var el = document.getElementById('wrapper-turma');
        
    if(el.lastChild.nodeValue == 0){
        console.log('Ultima div, nao remove');
    }else{
        el.lastChild.remove()
    }
}

function hideOptions(){
    if(toogle.style.display === "none"){
        toogle.style.display = "inline-block";
        btnO.value = "Menos opções";
    }else{
        toogle.style.display = "none";
        btnO.value = "Mais opções";
    }
}
