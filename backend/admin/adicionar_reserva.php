
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

// Validar dados recebidos
if (!$data || !isset($data['hospede_nome']) || !isset($data['hospede_email']) || 
    !isset($data['quarto_id']) || !isset($data['data_checkin']) || !isset($data['data_checkout'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados inválidos ou incompletos']);
    exit;
}

// Sanitizar dados
$hospede_nome = $conexao->real_escape_string($data['hospede_nome']);
$hospede_email = $conexao->real_escape_string($data['hospede_email']);
$hospede_telefone = $conexao->real_escape_string($data['hospede_telefone']);
$quarto_id = intval($data['quarto_id']);
$data_checkin = $conexao->real_escape_string($data['data_checkin']);
$data_checkout = $conexao->real_escape_string($data['data_checkout']);
$num_hospedes = intval($data['num_hospedes']);
$observacoes = isset($data['observacoes']) ? $conexao->real_escape_string($data['observacoes']) : '';
$status = isset($data['status']) ? $conexao->real_escape_string($data['status']) : 'pendente';

// Verificar disponibilidade do quarto
$sql_verificar = "SELECT COUNT(*) as count FROM reservas 
                  WHERE quarto_id = $quarto_id 
                  AND status != 'cancelada'
                  AND ((data_checkin <= '$data_checkin' AND data_checkout > '$data_checkin') 
                  OR (data_checkin < '$data_checkout' AND data_checkout >= '$data_checkout') 
                  OR ('$data_checkin' <= data_checkin AND '$data_checkout' >= data_checkin))";

$resultado_verificacao = $conexao->query($sql_verificar);
$disponibilidade = $resultado_verificacao->fetch_assoc();

if ($disponibilidade['count'] > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['erro' => 'Quarto não disponível para este período', 'disponivel' => false]);
    exit;
}

// Gerar código único para a reserva
$codigo = 'RES' . date('Ymd') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 5));

// Obter detalhes do quarto
$sql_quarto = "SELECT nome, preco_normal FROM quartos WHERE id = $quarto_id";
$resultado_quarto = $conexao->query($sql_quarto);

if ($resultado_quarto && $resultado_quarto->num_rows > 0) {
    $quarto = $resultado_quarto->fetch_assoc();
    $quarto_nome = $quarto['nome'];
    $valor_total = $quarto['preco_normal'];
    
    // Calcular número de diárias
    $checkin = new DateTime($data_checkin);
    $checkout = new DateTime($data_checkout);
    $intervalo = $checkin->diff($checkout);
    $diarias = $intervalo->days;
    
    // Calcular valor total
    $valor_total = $valor_total * $diarias;
} else {
    http_response_code(404);
    echo json_encode(['erro' => 'Quarto não encontrado']);
    exit;
}

// Inserir a reserva
$sql = "INSERT INTO reservas (codigo, hospede_nome, hospede_email, hospede_telefone, quarto_id, quarto_nome, 
        data_checkin, data_checkout, num_hospedes, valor_total, observacoes, status, data_criacao)
        VALUES ('$codigo', '$hospede_nome', '$hospede_email', '$hospede_telefone', $quarto_id, '$quarto_nome',
        '$data_checkin', '$data_checkout', $num_hospedes, $valor_total, '$observacoes', '$status', NOW())";

$resultado = $conexao->query($sql);

if ($resultado) {
    echo json_encode(['sucesso' => true, 'mensagem' => 'Reserva criada com sucesso', 'codigo' => $codigo]);
} else {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro ao criar reserva: ' . $conexao->error]);
}

$conexao->close();
?>
