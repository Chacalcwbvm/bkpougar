
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (para CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require '../conexao.php';

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Decodificar o corpo da requisição JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados inválidos ou incompletos']);
    exit;
}

$id = intval($data['id']);
$status = $conexao->real_escape_string($data['status']);

// Validar status permitidos
$allowedStatus = ['confirmada', 'pendente', 'cancelada', 'concluida'];
if (!in_array($status, $allowedStatus)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Status inválido']);
    exit;
}

// Atualizar status da reserva
$sql = "UPDATE reservas SET status = '$status' WHERE id = $id";
$resultado = $conexao->query($sql);

if ($resultado) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Status atualizado com sucesso']);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao atualizar status: ' . $conexao->error]);
}

$conexao->close();
?>
