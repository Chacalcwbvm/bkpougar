<?php
// Caminho: C:\pousada\backend\listar_quartos.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require 'conexao.php';
// Tratar preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Seu código continua abaixo...





// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Verifica se o arquivo foi enviado sem erros
if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] > 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'Nenhum arquivo enviado ou erro no upload']);
    exit;
}

// Define o diretório para upload
$upload_dir = 'http://localhost/pougar/backend/upload/';

// Cria o diretório se não existir
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Obtém a extensão do arquivo
$file_extension = strtolower(pathinfo($_FILES['imagem']['name'], PATHINFO_EXTENSION));

// Verifica se a extensão é permitida
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
if (!in_array($file_extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Formato de arquivo não permitido. Use apenas JPG, JPEG, PNG ou GIF']);
    exit;
}

// Gera um nome único para o arquivo
$new_filename = uniqid() . '.' . $file_extension;
$target_file = $upload_dir . $new_filename;

// Move o arquivo para o diretório de upload
if (move_uploaded_file($_FILES['imagem']['tmp_name'], $target_file)) {
    echo json_encode([
        'sucesso' => true,
        'arquivo' => $target_file,
        'url' => 'http://localhost/pougar/backend/upload' . $target_file,
        'mensagem' => 'Arquivo enviado com sucesso'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao salvar o arquivo']);
}
?>
