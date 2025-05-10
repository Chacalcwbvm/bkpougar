
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require '../conexao.php';

// Verifica se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

// Obtém o corpo da requisição
$dados = json_decode(file_get_contents('php://input'), true);

// Verifica se os campos obrigatórios foram fornecidos
if (!isset($dados['nome']) || !isset($dados['email']) || !isset($dados['telefone'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados incompletos']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$nome = $conexao->real_escape_string($dados['nome']);
$email = $conexao->real_escape_string($dados['email']);
$telefone = $conexao->real_escape_string($dados['telefone']);
$documento = isset($dados['documento']) ? $conexao->real_escape_string($dados['documento']) : '';
$nacionalidade = isset($dados['nacionalidade']) ? $conexao->real_escape_string($dados['nacionalidade']) : '';
$data_nascimento = isset($dados['data_nascimento']) ? $conexao->real_escape_string($dados['data_nascimento']) : NULL;
$endereco = isset($dados['endereco']) ? $conexao->real_escape_string($dados['endereco']) : '';

// Verifica se já existe um hóspede com esse e-mail
$sql = "SELECT id FROM hospedes WHERE email = '$email'";
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'Já existe um hóspede cadastrado com este e-mail']);
    exit;
}

// Constrói e executa a query
$sql = "INSERT INTO hospedes (nome, email, telefone, documento, nacionalidade, data_nascimento, endereco)
        VALUES ('$nome', '$email', '$telefone', '$documento', '$nacionalidade', " . 
        ($data_nascimento ? "'$data_nascimento'" : "NULL") . ", '$endereco')";

if ($conexao->query($sql) === TRUE) {
    $id = $conexao->insert_id;
    echo json_encode([
        'sucesso' => true, 
        'mensagem' => 'Hóspede adicionado com sucesso',
        'id' => $id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao adicionar hóspede: ' . $conexao->error]);
}

$conexao->close();
?>
