
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

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verifica se todos os campos obrigatórios foram fornecidos
if (!isset($dados['nome']) || !isset($dados['preco']) || !isset($dados['capacidade'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$nome = $conexao->real_escape_string($dados['nome']);
$name = $conexao->real_escape_string($dados['name'] ?? $dados['nome']);
$descricao = $conexao->real_escape_string($dados['descricao'] ?? '');
$description = $conexao->real_escape_string($dados['description'] ?? $dados['descricao'] ?? '');
$preco = floatval($dados['preco']);
$capacidade = intval($dados['capacidade']);
$tamanho = intval($dados['tamanho'] ?? 20);
$status = $conexao->real_escape_string($dados['status'] ?? 'disponivel');
$imagem = $conexao->real_escape_string($dados['imagem'] ?? '');

// Insere o novo quarto no banco de dados
$sql = "INSERT INTO quartos (nome, name, descricao, description, preco, capacidade, tamanho, status, imagem) 
        VALUES ('$nome', '$name', '$descricao', '$description', $preco, $capacidade, $tamanho, '$status', '$imagem')";

if ($conexao->query($sql) === TRUE) {
    $id = $conexao->insert_id;
    echo json_encode([
        'sucesso' => true, 
        'id' => $id, 
        'mensagem' => 'Quarto adicionado com sucesso'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao adicionar quarto: ' . $conexao->error]);
}

$conexao->close();
?>
