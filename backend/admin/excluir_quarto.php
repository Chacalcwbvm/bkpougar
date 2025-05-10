
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require '../conexao.php';

// Verifica se a requisição é DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o ID do quarto a ser excluído
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do quarto inválido']);
    exit;
}

// Verifica se existem reservas para este quarto
$sql = "SELECT COUNT(*) as total FROM reservas WHERE id_quarto = $id";
$resultado = $conexao->query($sql);
$row = $resultado->fetch_assoc();

if ($row['total'] > 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'Não é possível excluir um quarto com reservas associadas']);
    exit;
}

// Exclui o quarto do banco de dados
$sql = "DELETE FROM quartos WHERE id = $id";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Quarto excluído com sucesso']);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao excluir quarto: ' . $conexao->error]);
}

$conexao->close();
?>
