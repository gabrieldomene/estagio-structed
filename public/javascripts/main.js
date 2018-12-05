var idSala = O('sala-desc');
var capacidade = O('sala-capac');
var tipoSala = O('tipo-sala');
var fator1 = O("fator1");
var fator2 = O("fator2");
var fator3 = O("fator3");
var data_out = O("result-comb");
var toogle = O('advanced-options');
var btnO = O('btn-options');

function O(msg) {
    return document.getElementById(msg);
}

function remove() {
    var el = document.getElementById('wrapper-turma');

    if (el.lastChild.nodeValue == 0) {
        console.log('Ultima div, nao remove');
    } else {
        el.lastChild.remove()
    }
}

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
    selectSala.className = credit.className = selectDays.className = selectHour.className = "form-control";
    selectSala.required = true;
    selectSala.placeholder = "Escolha um tipo";
    credit.type = 'number';
    credit.placeholder = "Ex: 4";
    credit.name = 'creditos';
    credit.required = true;
    selectDays.name = 'dia';
    selectDays.required = true;
    selectHour.name = 'startTimer';
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


//Funções para salas
function editField(trID)
{   
    var btnID = '#'+trID+'btn'
    let newID = '"'+trID+'"'
    //console.log(btnID)
    $(btnID).removeClass('btn-warning').addClass('btn-success col-md-5').text('Confirmar').attr('onclick','sendEdit('+newID+')');
    var array_content = []

    let inputHash = "#"+trID
    let element = $(inputHash)
    let i = 0
    console.log(trID)

    $.each(element.find("td:not(:last-child)"), function(){
        i += 1
        //console.log(i)

        var content = $(this).text();
        var html = $(this).html();
        var input = $('<input></input>');
        input.val(content);
        input.addClass('form-control')
        input.css("text-align", "center");
        $(this).html(input);
        if(i == 1)
        {
            input.attr('name', 'descricao');
        }else if(i == 2){
            input.attr('name', 'capacidade');
            input.attr('type', 'number');
            input.attr('min', '0');
            input.attr('max', '100')
            input.attr('oninput', 'this.value = Math.abs(this.value)')
        }else{
            input.attr('name', 'tipoSala');
            input.attr('type', 'number');
            input.attr('min', '1');
            input.attr('max', '3')
            input.attr('oninput', 'this.value = Math.abs(this.value)')
        }
        //console.log("ELEMENTOS CONSOLE LOG")
        //console.log(element)
        //console.log(this)
        array_content.push(content)
    });
    //console.log(array_content)
}
//Funções para salas
function sendEdit(trID)
{
    let inputHash = "#"+trID

    let element = $(inputHash)
    let array = []
    let dadojson = {}


    // Percorre primeiro a linha da tabela achando seus respectivos TD associado no ID
    $.each(element.find('td:not(:last-child)'), function(){
        // Procura dentro de cada elemento TD os valores de seus input's
        var dado = $(this).find('input').val()
        array.push(dado)
    });

    dadojson = {old: trID, descricao:array[0], capacidade:array[1], tiposala:array[2]}

    $.ajax({
        type: 'POST',
        url: '/roomUpdate',
        data: dadojson,
        async: false,
        success: function(msg){
            if(msg == 'sucesso'){
                alert('Atualização completa, todos os campos alterados!');
                location.reload();
            }else if(msg == 'partial'){
                alert('ID já existente, somente capacidade e tipo alterado');
                location.reload();
            }else{
                alert('Erro, não atualizado!')
                location.reload();
            }
        }
    });
    console.log(dadojson)
}

//Funções para salas
function removeField(trID){
    console.log(trID);
    let dadosjson = {}
    dadosjson = {descricao : trID}
    console.log(dadosjson)
    $.ajax({
        type: 'POST',
        url: '/roomRemove',
        data: dadosjson,
        async: false,
        success: function(msg){
            if(msg == 'sucesso'){
                alert('Sala ' + trID + ' deletada com sucesso.');
                location.reload();
            }else{
                alert('Erro ao deletar ' + trID);
                location.reload();
            }
        }
    });
}

//Funções para disciplinas
function editDisciplina(trID)
{
    
    let inputHash = "#"+trID
    let element = $(inputHash)
    let array_content = []
    let dadojson = {}
    let old = ''
    var btnID = '#'+trID+'btn'
    let newID = '"'+trID+'"'
    //console.log(btnID)
    $(btnID).removeClass('btn-warning').addClass('btn-success col-md-5').text('Confirmar').attr('onclick','sendDisciplina('+newID+')');
    
    //Element pega a tr do id e em cells as 8 colunas, ultima é botao
    
    $.each(element.find('td:not(:last-child)'), function(){
        //Cada this é minhas linhas de td, separando em cada virgula
        let content = $(this).text().split(",");
        let input = $(document.createElement('input'));
        
        //Tamanho de cada "td"
        //console.log('Tamanho '+content.length)
        if(content.length > 1){//Se meus campos possuirem mais de um valor
            //Remove a primeira linha de texto
            $(this)[0].innerHTML = '';
            for(let i = 0; i < content.length; i++){
                //Cria os inputs de acordo com a quantidade (separados na vírgula)
                input.val(content[i]);
                input.addClass('form-control');
                input.attr('type', 'number');
                input.css("text-align", "center");
                $(this).append(input.clone());
            }
        }else{     
            input.val(content);
            input.addClass('form-control')
            input.css("text-align", "center");
            $(this).html(input)
        }
    });
}

function sendDisciplina(trID){
    
    let inputHash = "#"+trID

    let element = $(inputHash)
    let array = []
    let dadojson = {}
    let n = 0
    let old = ''

    // Percorre primeiro a linha da tabela achando seus respectivos TD associado no ID
    $.each(element.find('td:not(:last-child)'), function(){
        // Procura dentro de cada elemento TD os valores de seus input's
        var dado = $(this).find('input')
        
        if(dado.length > 1){
            //dado retorna um vetor de n posicoes (dado[n] acessa a posicao passada)
            /* console.log(dado.length)
            console.log('pula linha') */
            let temp_array = []
            for(let i =0; i < dado.length; i++){
                let temp = $(dado[i]).val()
                temp_array.push(temp)
            }
            array.push(temp_array)

            
        }else{
            if(n == 1) old = dado.val() //Guarda valor do id disciplina para não ser igual
            array.push(dado.val())
        }
        n = n+1
    });
    let jso = JSON.stringify(array[4])
    console.log(jso)
    console.log(typeof(jso))
    console.log(array[4])
    console.log(typeof(array[4]))
    //console.log(typeof(array[4][0]))
    dadojson = {old:old, descricao:array[0], fase:array[1], oferta:array[2], demanda:array[3], dia:array[4], start:array[5], creditos:array[6], tipoSalaTurma:array[7]}
    $.ajax({
        type: 'POST',
        url: '/classUpdate',
        data: dadojson,
        async: false,
        success: function(msg){
            if(msg == 'sucesso'){
                alert('Atualização completa, todos os campos alterados!');
                location.reload();
            }else if(msg == 'partial'){
                alert('Turma já existente, somente os outros dados alterados');
                location.reload();
            }else{
                //alert('Erro, não atualizado!')
                //location.reload();
            }
        }
    });
    
}

function removeDisciplina(trID){
    console.log(trID);
    let dadosjson = {}
    dadosjson = {descricao : trID}
    console.log(dadosjson)
    $.ajax({
        type: 'POST',
        url: '/classRemove',
        data: dadosjson,
        async: false,
        success: function(msg){
            if(msg == 'sucesso'){
                alert('Disciplina ' + trID + ' deletada com sucesso.');
                location.reload();
            }else{
                alert('Erro ao deletar ' + trID);
                location.reload();
            }
        }
    });
}

