<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:8080');
require 'conexao.php';

// Pegar o idioma da requisição (padrão: en)
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'en';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    http_response_code(400);
    $erro = $lang == 'pt' ? 'ID do quarto não fornecido' : 'Room ID not provided';
    echo json_encode(['erro' => $erro]);
    exit;
}

$id = $conexao->real_escape_string($_GET['id']);
$sql = "SELECT * FROM quartos WHERE id = $id";
$resultado = $conexao->query($sql);

if ($resultado->num_rows > 0) {
    $quarto = $resultado->fetch_assoc();
    echo json_encode($quarto);
} else {
    http_response_code(404);
    $erro = $lang == 'pt' ? 'Quarto não encontrado' : 'Room not found';
    echo json_encode(['erro' => $erro]);
}

$conexao->close();
?>
