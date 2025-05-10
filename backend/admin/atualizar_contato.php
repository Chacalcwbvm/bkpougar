
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

require '../conexao.php';

// Verifica se a requisição é PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verifica se o ID do contato foi fornecido
if (!isset($dados['id']) || !isset($dados['status'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do contato e status são obrigatórios']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$id = intval($dados['id']);
$status = $conexao->real_escape_string($dados['status']);

// Verifica se o status é válido
if (!in_array($status, ['novo', 'respondido', 'arquivado'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Status inválido']);
    exit;
}

// Atualiza o status do contato
$sql = "UPDATE contatos SET status = '$status' WHERE id = $id";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Status atualizado com sucesso']);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao atualizar status: ' . $conexao->error]);
}

$conexao->close();
?>
