
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require 'conexao.php';

// Parâmetros necessários
$data_checkin = isset($_GET['checkin']) ? $conexao->real_escape_string($_GET['checkin']) : null;
$data_checkout = isset($_GET['checkout']) ? $conexao->real_escape_string($_GET['checkout']) : null;
$hospedes = isset($_GET['hospedes']) ? intval($_GET['hospedes']) : 1;
$quarto_id = isset($_GET['quarto_id']) ? intval($_GET['quarto_id']) : null;

if (!$data_checkin && !$data_checkout && !$quarto_id) {
    http_response_code(400);
    echo json_encode(['erro' => 'Parâmetros insuficientes', 'disponivel' => false]);
    exit;
}

// Verifica se as datas são válidas quando fornecidas
if ($data_checkin && $data_checkout) {
    try {
        $checkin = new DateTime($data_checkin);
        $checkout = new DateTime($data_checkout);
        $hoje = new DateTime();
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['erro' => 'Formato de data inválido', 'disponivel' => false]);
        exit;
    }

    if ($checkin < $hoje) {
        http_response_code(400);
        echo json_encode(['erro' => 'A data de check-in deve ser futura', 'disponivel' => false]);
        exit;
    }

    if ($checkout <= $checkin) {
        http_response_code(400);
        echo json_encode(['erro' => 'A data de check-out deve ser posterior à data de check-in', 'disponivel' => false]);
        exit;
    }
}

// Verifica se a tabela reservas existe
$check_table = $conexao->query("SHOW TABLES LIKE 'reservas'");
if ($check_table->num_rows == 0) {
    // Cria a tabela de reservas se não existir
    $sql_create = "CREATE TABLE reservas (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL,
        id_quarto INT(11) NOT NULL,
        id_hospede INT(11) NOT NULL,
        data_checkin DATE NOT NULL,
        data_checkout DATE NOT NULL,
        numero_hospedes INT(2) NOT NULL,
        valor_total DECIMAL(10,2) NOT NULL,
        observacoes TEXT,
        status VARCHAR(20) DEFAULT 'confirmada',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conexao->query($sql_create);
}

// Verifica se a tabela quartos existe
$check_table = $conexao->query("SHOW TABLES LIKE 'quartos'");
if ($check_table->num_rows == 0) {
    // Se a tabela de quartos não existe, não há quartos disponíveis
    echo json_encode([
        'disponivel' => false,
        'quartos' => [],
        'datas_ocupadas' => [],
        'checkin' => $data_checkin,
        'checkout' => $data_checkout,
        'hospedes' => $hospedes,
        'erro' => 'Tabela de quartos não encontrada'
    ]);
    exit;
}

// Se apenas o ID do quarto foi fornecido, retornamos as datas ocupadas
if ($quarto_id && !$data_checkin && !$data_checkout) {
    $sql_datas_ocupadas = "SELECT data_checkin, data_checkout FROM reservas 
                          WHERE id_quarto = $quarto_id 
                          AND status != 'cancelada'
                          AND data_checkout >= CURRENT_DATE()";
    
    $resultado_datas = $conexao->query($sql_datas_ocupadas);
    $datas_ocupadas = [];
    
    if ($resultado_datas && $resultado_datas->num_rows > 0) {
        while($row = $resultado_datas->fetch_assoc()) {
            $datas_ocupadas[] = [
                'checkin' => $row['data_checkin'],
                'checkout' => $row['data_checkout']
            ];
        }
    }
    
    echo json_encode([
        'datas_ocupadas' => $datas_ocupadas,
        'quarto_id' => $quarto_id
    ]);
    exit;
}

// CORREÇÃO: Busca quartos disponíveis que comportem o número de hóspedes
// Esta é a consulta corrigida que verifica corretamente os períodos de sobreposição de reservas
$sql = "SELECT q.* FROM quartos q 
        WHERE q.status = 'disponivel' 
        AND q.capacidade >= $hospedes";

// Adiciona filtro para quarto específico se fornecido
if ($quarto_id) {
    $sql .= " AND q.id = $quarto_id";
}

// Adiciona verificação de disponibilidade de data se ambas as datas forem fornecidas
if ($data_checkin && $data_checkout) {
    $sql .= " AND q.id NOT IN (
            SELECT r.id_quarto FROM reservas r 
            WHERE r.status != 'cancelada'
            AND (
                (r.data_checkin <= '$data_checkin' AND r.data_checkout > '$data_checkin')
                OR (r.data_checkin < '$data_checkout' AND r.data_checkout >= '$data_checkout')
                OR ('$data_checkin' <= r.data_checkin AND '$data_checkout' > r.data_checkin)
            )
        )";
}

$sql .= " ORDER BY q.preco ASC";

$resultado = $conexao->query($sql);

$quartos_disponiveis = [];
if ($resultado && $resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $quartos_disponiveis[] = $row;
    }
}

echo json_encode([
    'disponivel' => count($quartos_disponiveis) > 0,
    'quartos' => $quartos_disponiveis,
    'checkin' => $data_checkin,
    'checkout' => $data_checkout,
    'hospedes' => $hospedes
]);

$conexao->close();
?>
