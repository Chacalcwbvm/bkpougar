<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verifica se todos os campos obrigatórios foram fornecidos
if (!isset($dados['nome']) || !isset($dados['email']) || !isset($dados['mensagem'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$nome = $conexao->real_escape_string($dados['nome']);
$email = $conexao->real_escape_string($dados['email']);
$telefone = $conexao->real_escape_string($dados['telefone'] ?? '');
$mensagem = $conexao->real_escape_string($dados['mensagem']);

// Insere o contato no banco de dados
$sql = "INSERT INTO contatos (nome, email, telefone, mensagem) 
        VALUES ('$nome', '$email', '$telefone', '$mensagem')";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Mensagem enviada com sucesso']);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao enviar mensagem: ' . $conexao->error]);
}

$conexao->close();
?>
