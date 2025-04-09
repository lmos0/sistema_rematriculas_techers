// utils/validacao.js

function validarCamposObrigatorios(obj, camposObrigatorios) {
    return camposObrigatorios.every(campo => obj[campo]);
  }
  
  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }
  
  function calcularValoresProximosAno({ curso, level_atual, valor_2024, quantidade_parcelas_2024, reajuste }) {
    const taxaReajuste = (Number(reajuste) / 100) + 1;
    const level_2025 = curso !== 'Programação' ? 2 : Number(level_atual) + 1;
    const valor_2025 = (valor_2024 * taxaReajuste) * quantidade_parcelas_2024;
    return { level_2025, valor_2025, taxaReajuste };
  }
  
  function tratarErro(res, erro, mensagem = 'Erro interno') {
    console.error(mensagem, erro);
    return res.status(500).json({ error: erro.message });
  }
  
  module.exports = {
    validarCamposObrigatorios,
    validarCPF,
    calcularValoresProximosAno,
    tratarErro
  };
  