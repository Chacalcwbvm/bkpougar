
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require '../conexao.php';

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Get request body
$dados = json_decode(file_get_contents('php://input'), true);

// Check if ID was provided
if (!isset($dados['id'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID da reserva não fornecido']);
    exit;
}

$id = intval($dados['id']);

// Delete the reservation
$sql = "DELETE FROM reservas WHERE id = $id";

if ($conexao->query($sql) === TRUE) {
    if ($conexao->affected_rows > 0) {
        echo json_encode(['sucesso' => true, 'mensagem' => 'Reserva excluída com sucesso']);
    } else {
        http_response_code(404);
        echo json_encode(['erro' => 'Reserva não encontrada']);
    }
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao excluir reserva: ' . $conexao->error]);
}

$conexao->close();
?>
