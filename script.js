// Atividade 2 - Estados e cidades com a API do IBGE
const selectEstado = document.getElementById('estado');
const selectCidade = document.getElementById('cidade');
const qtdCidades = document.getElementById('qtdCidades');
const mensagem = document.getElementById('mensagem');
const resumo = document.getElementById('resumo');
const inscrever = document.getElementById('inscrever');
const tentarNovamente = document.getElementById('tentarNovamente');
const formulario = document.getElementById('formInscricao');
const URL_ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome';
let ultimaConsulta = 0;
let repetirConsulta = carregarEstados;

function opcao(texto, valor = '') {
    const item = document.createElement('option');
    item.textContent = texto;
    item.value = valor;
    return item;
}

function carregarEstados() {
    mensagem.textContent = '';
    tentarNovamente.hidden = true;
    selectEstado.disabled = true;
    selectEstado.replaceChildren(opcao('Carregando estados...'));
    return fetch(URL_ESTADOS)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao buscar estados.');
            return resposta.json();
        })
        .then(estados => {
            if (!Array.isArray(estados) || estados.length === 0) throw new Error('Lista de estados indisponível.');
            selectEstado.replaceChildren(opcao('Selecione o estado'));
            estados.forEach(estado => {
                selectEstado.appendChild(opcao(estado.nome, estado.sigla));
            });
            selectEstado.disabled = false;
        })
        .catch(() => {
            selectEstado.replaceChildren(opcao('Não foi possível carregar'));
            mensagem.textContent = 'Não foi possível carregar os estados. Verifique sua conexão e tente novamente.';
            repetirConsulta = carregarEstados;
            tentarNovamente.hidden = false;
        });
}

function carregarCidades() {
    const uf = selectEstado.value;
    // Se o usuário trocar o estado rapidamente, apenas a última resposta será usada.
    const consulta = ++ultimaConsulta;
    selectCidade.disabled = true;
    inscrever.disabled = true;
    qtdCidades.textContent = '';
    resumo.textContent = '';
    mensagem.textContent = '';
    tentarNovamente.hidden = true;
    selectCidade.replaceChildren(opcao(uf ? 'Carregando...' : 'Escolha um estado primeiro'));
    if (uf === '') return;

    return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
        .then(resposta => {
            if (!resposta.ok) throw new Error('Erro ao buscar cidades.');
            return resposta.json();
        })
        .then(cidades => {
            if (consulta !== ultimaConsulta) return;
            if (!Array.isArray(cidades)) throw new Error('Lista de cidades inválida.');
            cidades.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
            selectCidade.replaceChildren(opcao(cidades.length ? 'Selecione a cidade' : 'Nenhuma cidade encontrada'));
            cidades.forEach(cidade => {
                selectCidade.appendChild(opcao(cidade.nome, cidade.nome));
            });
            selectCidade.disabled = cidades.length === 0;
            qtdCidades.textContent = `${uf} tem ${cidades.length} cidades.`;
        })
        .catch(() => {
            if (consulta !== ultimaConsulta) return;
            selectCidade.replaceChildren(opcao('Não foi possível carregar'));
            mensagem.textContent = 'Não foi possível carregar as cidades. Verifique sua conexão e tente novamente.';
            repetirConsulta = carregarCidades;
            tentarNovamente.hidden = false;
        });
}

selectEstado.addEventListener('change', carregarCidades);
selectCidade.addEventListener('change', () => {
    resumo.textContent = '';
    inscrever.disabled = selectCidade.disabled || selectCidade.value === '';
});
tentarNovamente.addEventListener('click', () => repetirConsulta());
formulario.addEventListener('input', () => { resumo.textContent = ''; });
formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    const nome = document.getElementById('nome');
    nome.value = nome.value.trim();
    if (!formulario.reportValidity() || selectCidade.disabled || !selectEstado.value || !selectCidade.value) return;
    resumo.textContent = `${nome.value}, de ${selectCidade.value}/${selectEstado.value}, inscrito com sucesso`;
});

carregarEstados();
