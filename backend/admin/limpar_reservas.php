
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

// Clear all reservations
$sql = "DELETE FROM reservas";

if ($conexao->query($sql) === TRUE) {
    echo json_encode([
        'sucesso' => true, 
        'mensagem' => 'Todas as reservas foram excluídas com sucesso',
        'registros_afetados' => $conexao->affected_rows
    ]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao excluir reservas: ' . $conexao->error]);
}

$conexao->close();
?>
