
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

// Verifica se o ID do quarto foi fornecido
if (!isset($dados['id'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID do quarto não fornecido']);
    exit;
}

// Escapa os dados para evitar injeção SQL
$id = intval($dados['id']);
$atualizacoes = [];

// Campos que podem ser atualizados
$campos = ['nome', 'descricao', 'preco', 'capacidade', 'tamanho', 'status', 'imagem'];

// Constrói a query dinâmica com base nos campos fornecidos
foreach ($campos as $campo) {
    if (isset($dados[$campo])) {
        if (in_array($campo, ['preco'])) {
            $valor = floatval($dados[$campo]);
            $atualizacoes[] = "$campo = $valor";
        } else if (in_array($campo, ['capacidade', 'tamanho'])) {
            $valor = intval($dados[$campo]);
            $atualizacoes[] = "$campo = $valor";
        } else {
            $valor = $conexao->real_escape_string($dados[$campo]);
            $atualizacoes[] = "$campo = '$valor'";
        }
    }
}

// Se não houver campos para atualizar
if (empty($atualizacoes)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Nenhum campo para atualizar']);
    exit;
}

// Constrói e executa a query
$sql = "UPDATE quartos SET " . implode(', ', $atualizacoes) . " WHERE id = $id";

if ($conexao->query($sql) === TRUE) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Quarto atualizado com sucesso']);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao atualizar quarto: ' . $conexao->error]);
}

$conexao->close();
?>
